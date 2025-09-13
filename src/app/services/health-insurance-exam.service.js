import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';
import axios from 'axios';
import QRCode from 'qrcode';

class HealthInsuranceExamService {
  // Cache kết quả check BHYT thành công (key: maThe)
  bhytResultCache = {};

  // Chuyển đổi dữ liệu BHYT sang format chuẩn cho API bên thứ 3
  convertBHYTToThirdParty(bhytData) {
    return {
      "Domain": "01821",
      SoBHYT: bhytData.maThe,
      HoVaTen: bhytData.hoTen,
      NgaySinh: bhytData.ngaySinh,
      GioiTinh: bhytData.gioiTinh === 'Nam',
      DiaChi: bhytData.diaChi,
      NoiDKBD: bhytData.maDKBD,
      TenBenhVienDKBD: bhytData.tenDKBDMoi || '',
      NgayDangKy: bhytData.gtTheTu,
      NgayHieuLuc: bhytData.gtTheTu,
      NgayHetHan: bhytData.gtTheDen,
      IsBHYT5Nam: !!bhytData.ngayDu5Nam,
      NgayDu5Nam: bhytData.ngayDu5Nam,
      MaSoBHXH: bhytData.maSoBHXH,
      IsMaTheMoi: !!bhytData.maTheMoi,
    };
  }
  // Lock để đồng bộ lấy token mới khi gặp lỗi 401
  bhytTokenLock = false;
  // Cache token/id_token cho BHYT với TTL
  bhytTokenCache = { 
    token: null, 
    id_token: null, 
    expiresAt: null 
  };
  // Cache template để giảm DB query
  templatesCache = { 
    data: null, 
    expiresAt: null 
  };

  // === Gọi API an toàn với retry cho lỗi mạng ===
  async safePost(url, body, options = {}, maxRetry = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      try {
        return await axios.post(url, body, { timeout: 15000, ...options });
      } catch (err) {
        if (['ECONNRESET','ECONNABORTED'].includes(err.code) || err.message.includes('timeout')) {
          lastError = err;
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  // === Lấy token BHYT với TTL từ server response ===
  async getBHYTToken() {
    while (this.bhytTokenLock) await new Promise(r => setTimeout(r, 100));
    
    // Check TTL cache
    if (this.bhytTokenCache.token && 
        this.bhytTokenCache.id_token && 
        this.bhytTokenCache.expiresAt > Date.now()) {
      return this.bhytTokenCache;
    }

    this.bhytTokenLock = true;
    try {
      const { BHYT_USERNAME: username, BHYT_PASSWORD: password, BHYT_TOKEN_URL: url } = process.env;

      const tokenRes = await this.safePost(url, { username, password });
      const apiKey = tokenRes.data.APIKey || {};
      
      // Tính TTL từ expires_in của server hoặc fallback 15 phút
      let expiresAt;
      if (apiKey.expires_in) {
        // Parse ISO string từ server: "2025-09-05T07:31:44.6200586Z"
        expiresAt = new Date(apiKey.expires_in).getTime();
        
        // Safety buffer: Trừ đi 30 giây để tránh edge case
        expiresAt -= (30 * 1000);
      } else {
        // Fallback: 15 phút nếu không có expires_in
        expiresAt = Date.now() + (15 * 60 * 1000);
      }
      
      this.bhytTokenCache = { 
        token: apiKey.access_token || '', 
        id_token: apiKey.id_token || '',
        expiresAt: expiresAt
      };
      
      return this.bhytTokenCache;
    } finally {
      this.bhytTokenLock = false;
    }
  }

  // === Kiểm tra thẻ BHYT với cơ chế refresh token khi gặp 401 ===
  async checkBHYTCard({ maThe, hoTen, ngaySinh }) {
    // Tham số đã dùng đúng tên tiếng Việt, không cần thay đổi
    const { BHYT_USERNAME: username, BHYT_PASSWORD: password, BHYT_HOTENCB: hoTenCb, BHYT_CCCDCB: cccdCb, BHYT_CHECK_URL: bhytCheckUrl } = process.env;
    
    if (!bhytCheckUrl) {
      console.error('❌ [BHYT_SERVICE] Missing BHYT_CHECK_URL in environment variables');
      return { success: false, message: 'Cấu hình API BHYT không đúng' };
    }
    
    console.log('🔄 [BHYT_SERVICE] Getting token...');
    let { token, id_token } = await this.getBHYTToken();
    const body = { maThe, hoTen, ngaySinh, hoTenCb, cccdCb };

    const requestAPI = async () => {
      const url = `${bhytCheckUrl}?id_token=${id_token}&password=${password}&token=${token}&username=${username}`;
      return await this.safePost(url, body);
    };

    try {
      let response = await requestAPI();

      if (response.data?.maKetQua === "401") {
        this.bhytTokenCache = { token: null, id_token: null, expiresAt: null };
        ({ token, id_token } = await this.getBHYTToken());
        await new Promise(r => setTimeout(r, 1000));
        response = await requestAPI();

        if (response.data?.maKetQua === "401") {
          return { success: false, message: response.data.ghiChu || "Token không đúng.", code: "401", data: response.data };
        }
      }

      // Chỉ có maKetQua = "000" là thành công, tất cả các mã khác đều là lỗi
      if (response.data?.maKetQua === "000") {
        // Cache kết quả convert cho maThe
        const converted = this.convertBHYTToThirdParty(response.data);
        this.bhytResultCache[maThe] = converted;
        return { success: true, data: response.data, converted };
      } else {
        return { 
          success: false, 
          message: response.data?.ghiChu || `Thẻ BHYT không hợp lệ (mã lỗi: ${response.data?.maKetQua})`, 
          code: response.data?.maKetQua,
          data: response.data 
        };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // === Cache templates với TTL để giảm DB query ===
  async getTemplatesCache() {
    if (this.templatesCache.data && this.templatesCache.expiresAt > Date.now()) {
      return this.templatesCache.data;
    }

    const TimeSlotTemplate = (await import('../../models/time-slot-template.model.js')).default;
    const templates = await TimeSlotTemplate.find({ is_active: true }).lean();
    
    // Cache 5 phút
    this.templatesCache = {
      data: templates,
      expiresAt: Date.now() + (5 * 60 * 1000)
    };
    
    return templates;
  }

  // === Tạo hoặc lấy slot với logic tự động tìm slot tiếp theo cho receptionist ===
  async getOrCreateSlot(exam_date, exam_time, phongKham, role) {
  const ScheduleSlot = (await import('../../models/schedule-slot.model.js')).default;
  const TimeSlotTemplate = (await import('../../models/time-slot-template.model.js')).default;

  // Hàm helper để tìm khung giờ tiếp theo
  const findNextAvailableSlot = (currentTime, templates) => {
      const toMinutes = t => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const target = toMinutes(currentTime);
      
      // Tìm khung giờ tiếp theo (sau thời gian yêu cầu)
      let nextSlot = null;
      let minTimeDiff = Infinity;
      
      for (const tpl of templates) {
        const tplMinutes = toMinutes(tpl.time);
        if (tplMinutes > target && (tplMinutes - target) < minTimeDiff) {
          minTimeDiff = tplMinutes - target;
          nextSlot = tpl;
        }
      }
      
      // ✅ Chỉ tìm khung giờ sau thời gian yêu cầu, không fallback về đầu
      if (!nextSlot) {
        return null; // Không tìm thấy khung giờ nào phù hợp
      }
      
      return nextSlot;
    };


    let template = await TimeSlotTemplate.findOne({ time: exam_time, is_active: true }).lean();
    let adjustedTime = exam_time;

    // Lấy cached templates để tái sử dụng và giảm DB load
    const allTemplates = await this.getTemplatesCache();

    if (allTemplates.length === 0) {
      throw new Error('Không có khung giờ mẫu nào đang hoạt động');
    }

    // ✅ Logic xử lý theo role
    if (!template) {
      if (role === 'receptionist') {
        // Receptionist: Tự động tìm khung giờ tiếp theo
        const foundTemplate = findNextAvailableSlot(exam_time, allTemplates);
        if (!foundTemplate) {
          throw new Error('Không tìm thấy khung giờ mẫu nào phù hợp');
        }
        template = foundTemplate;
        adjustedTime = template.time;
      } else {
        // User: Báo lỗi nếu không có khung giờ mẫu chính xác
        throw new Error(`Khung giờ ${exam_time} không có trong lịch khám. Vui lòng chọn khung giờ khác.`);
      }
    }

    // Logic tự động tìm slot trống cho receptionist - batch check
    let slot = null;

    // Pre-check 5 slots cùng lúc để tối ưu
    const slotsToCheck = [];
    let currentTime = adjustedTime;
    let currentTemplate = template;

    for (let i = 0; i < 5; i++) {
      slotsToCheck.push({
        date: exam_date,
        timeSlot: currentTime,
        phongKham: phongKham, 
        template: currentTemplate
      });

      if (i < 4) {
        const nextTemplate = findNextAvailableSlot(currentTime, allTemplates);
        if (!nextTemplate) break;
        currentTime = nextTemplate.time;
        currentTemplate = nextTemplate;
      }
    }

    // Batch query để check tất cả slots cùng lúc
    const existingSlots = await ScheduleSlot.find({
      date: exam_date,
      timeSlot: { $in: slotsToCheck.map(s => s.timeSlot) },
      phongKham: phongKham
    }).lean();

    // Tìm slot có thể sử dụng
    for (const slotInfo of slotsToCheck) {
      const existingSlot = existingSlots.find(s => s.timeSlot === slotInfo.timeSlot);

      // Nếu slot chưa tồn tại, tạo mới
      if (!existingSlot) {
        try {
          slot = await ScheduleSlot.create({
            date: exam_date,
            timeSlot: slotInfo.timeSlot,
            phongKham: slotInfo.phongKham,
            capacity: slotInfo.template.capacity,
            currentCount: 1,
            is_active: true
          });
          adjustedTime = slotInfo.timeSlot;
          break;
        } catch (err) {
          if (err.code === 11000) continue;
          throw err;
        }
      }

      // Nếu slot còn chỗ trống
      if (existingSlot.currentCount < existingSlot.capacity) {
        const updatedSlot = await ScheduleSlot.findByIdAndUpdate(
          existingSlot._id,
          { $inc: { currentCount: 1 } },
          { new: true }
        );

        if (updatedSlot && updatedSlot.currentCount <= updatedSlot.capacity) {
          slot = updatedSlot;
          adjustedTime = slotInfo.timeSlot;
          break;
        }
      }

      if (role !== 'receptionist') {
        throw new Error('Slot đã đầy, vui lòng chọn khung giờ khác');
      }
    }

    if (!slot) {
      throw new Error('Không tìm thấy khung giờ trống nào trong ngày');
    }

    return {
      slot,
      adjustedTime
    };
  }

  // === Tạo lịch khám với order number logic fixed ===
  async createExam(data) {
    // Sử dụng phongKham cho slot và queue logic
    const { slot, adjustedTime } = await this.getOrCreateSlot(data.exam_date, data.exam_time, data.phongKham, data.role);

    // Cập nhật lại giờ khám nếu có điều chỉnh
    data.exam_time = adjustedTime;
    data.status = data.role === 'receptionist' ? 'accept' : 'pending';
    data.slotId = slot._id;
    data.phongKham = slot.phongKham;

    // Lấy order number TRƯỚC khi tạo exam nếu status là accept
    if (data.status === 'accept') {
      const maxOrder = await healthInsuranceExamRepository.findMaxOrderNumber(data.exam_date);
      data.order_number = maxOrder + 1;
    }

    // Parallel operations sau khi đã có order_number
    const [exam, phongKhamObj] = await Promise.all([
      healthInsuranceExamRepository.create(data),
      (async () => {
        const PhongKham = (await import('../../models/phong-kham.model.js')).default;
        return PhongKham.findOne({ _id: data.phongKham }, 'ten').lean();
      })()
    ]);

      const encodedId = Buffer.from(exam._id.toString()).toString('base64');
      const qrImageBase64 = await QRCode.toDataURL(encodedId);

      return {
        exam: {
          ...exam.toObject(),
          phongKham: exam.phongKham, // id
          clinic: phongKhamObj?.ten || '' // top-level field
        },
        qr_code: qrImageBase64,
        encoded_id: encodedId
      };
  }

  // === Check lịch khám theo QR code với parallel operations ===
  async checkExamByEncodedId(encodedId) {
    let id;
    try { id = Buffer.from(encodedId, 'base64').toString('utf-8'); } 
    catch { throw new Error('QR code không hợp lệ'); }

    const exam = await healthInsuranceExamRepository.findById(id);
    if (!exam) throw new Error('Không tìm thấy lịch khám');

    const now = new Date();
    const [h,m] = exam.exam_time.split(':').map(Number);
    const examDateTime = new Date(exam.exam_date); examDateTime.setHours(h,m,0,0);

    if (now < examDateTime) return { valid: false, message: 'Chưa tới giờ khám', exam };

    if ((now - examDateTime)/(1000*60) > 15) {
      // Atomic update để reject exam
      await healthInsuranceExamRepository.updateOrderNumber(exam._id, null, 'reject');
      return { valid: false, message: 'Lịch khám bị hủy do tới trễ quá 15 phút', exam };
    }

    if (exam.status !== 'accept') {
      // Lấy max order number trước - lọc theo ngày hiện tại
      const today = new Date();
      today.setHours(0,0,0,0);
      const maxOrder = await healthInsuranceExamRepository.findMaxOrderNumber(today);
      const newOrderNumber = maxOrder + 1;
      
      // Update exam với order number và status
      const updatedExam = await healthInsuranceExamRepository.updateOrderNumber(exam._id, newOrderNumber, 'accept');
      
      // Cập nhật object exam để trả về đúng
      exam.status = 'accept';
      exam.order_number = newOrderNumber;
    }

    return { valid: true, message: 'Lịch khám hợp lệ, check-in thành công', exam };
  }

  // === Push lên HIS (placeholder) ===
  async pushToHIS(exam) {
    console.log('Đẩy thông tin lên HIS:', exam._id);
  }
}

export default new HealthInsuranceExamService();
