import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';
import axios from 'axios';
import QRCode from 'qrcode';
import https from 'https';

class HealthInsuranceExamService {
  
  formatDisplayDateTime(date, showTimeComponent = true) {
  if (!date) return '';
  try {
    let d;

    if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      // Trường hợp dd/MM/yyyy
      const [day, month, year] = date.split('/');
      d = new Date(`${year}-${month}-${day}T00:00:00`);
    } else {
      d = new Date(date); // ISO hay timestamp
    }

    if (isNaN(d.getTime())) return '';

    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();

    if (!showTimeComponent) {
      return `${month}/${day}/${year}`;
    }

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${month}/${day}/${year}`;
  } catch {
    return '';
  }
}

  //Khai báo agent 
  agent = new https.Agent({
    cert: process.env.CSS ? Buffer.from(process.env.CSS) : undefined,
    key: process.env.CSS ? Buffer.from(process.env.CSS) : undefined,
    rejectUnauthorized: false // dev, prod nên true
  });
  // Cache kết quả check BHYT thành công (key: maThe)
  bhytResultCache = {};
  
  // Chuyển đổi dữ liệu BHYT sang format chuẩn cho API bên thứ 3
  convertBHYTToThirdParty(bhytData) {
    return {
      "Domain": process.env.DOMAIN,
      SoBHYT: bhytData.maThe,
      HoVaTen: bhytData.hoTen,
      NgaySinh: bhytData.ngaySinh,
      GioiTinh: bhytData.gioiTinh === 'Nam',
      DiaChi: bhytData.diaChi,
      NoiDKBD: bhytData.maDKBD,
      TenBenhVienDKBD: bhytData.tenDKBDMoi || '',
      NgayDangKy: this.formatDisplayDateTime(bhytData.gtTheTu),
      NgayHieuLuc: this.formatDisplayDateTime(bhytData.gtTheTu),
      NgayHetHan: this.formatDisplayDateTime(bhytData.gtTheDen),
      Active: true,
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
    console.log('🔍 [BHYT_CHECK] Bắt đầu kiểm tra thẻ BHYT:', { maThe, hoTen, ngaySinh });
    
    // Log thông tin cache hiện tại trước khi kiểm tra
    console.log('🔍 [BHYT_CACHE] Trạng thái cache trước kiểm tra:');
    console.log('   - Số lượng mã thẻ trong cache:', Object.keys(this.bhytResultCache).length);
    console.log('   - Danh sách mã thẻ trong cache:', Object.keys(this.bhytResultCache));
    
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
        
        // Log dữ liệu converted để debug
        console.log('✅ [BHYT_CACHE] Lưu dữ liệu vào cache cho mã thẻ:', maThe);
        console.log('✅ [BHYT_CACHE] Dữ liệu converted:', JSON.stringify(converted, null, 2));
        
        // Lưu vào cache
        this.bhytResultCache[maThe] = converted;
        
        // Log danh sách cache hiện tại
        console.log('✅ [BHYT_CACHE] Danh sách cache hiện tại:', 
          Object.keys(this.bhytResultCache).map(key => ({ key, hasData: !!this.bhytResultCache[key] })));
        
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
    
    console.log(`🔄 [TEMPLATES] Đã load ${templates.length} khung giờ mẫu từ database`);
    
    // Cache 5 phút
    this.templatesCache = {
      data: templates,
      expiresAt: Date.now() + (5 * 60 * 1000)
    };
    
    return templates;
  }

  // === Tạo hoặc lấy slot với logic tự động tìm slot tiếp theo cho receptionist ===
  async getOrCreateSlot(exam_date, exam_time, IdPhongKham, role) {
  const ScheduleSlot = (await import('../../models/schedule-slot.model.js')).default;
  const TimeSlotTemplate = (await import('../../models/time-slot-template.model.js')).default;

  console.log(`🔍 [SLOT] Tìm slot cho phòng: ${IdPhongKham}, ngày: ${new Date(exam_date).toLocaleDateString()}, giờ: ${exam_time}`);

  // Hàm helper để tìm khung giờ tiếp theo
  const findNextAvailableSlot = (currentTime, templates) => {
      // Format time đầu vào để đảm bảo định dạng HH:MM
      const formatTime = (timeStr) => {
        try {
          const [h, m] = timeStr.split(':').map(Number);
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        } catch (e) {
          // Trường hợp lỗi, trả về chính định dạng đầu vào
          return timeStr;
        }
      };
      
      const toMinutes = t => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      
      // Format lại thời gian để đảm bảo định dạng đúng
      const formattedCurrentTime = formatTime(currentTime);
      const target = toMinutes(formattedCurrentTime);
      
      console.log(`🔍 [SLOT] Đang tìm khung giờ phù hợp cho thời điểm ${formattedCurrentTime} (${target} phút)`);
      console.log(`🔍 [SLOT] Có ${templates.length} khung giờ mẫu khả dụng: `, templates.map(t => t.time).join(', '));
      
      // Nếu thời gian yêu cầu chính xác là một khung giờ, trả về khung giờ đó
      const exactMatch = templates.find(tpl => tpl.time === formattedCurrentTime);
      if (exactMatch) {
        console.log(`✅ [SLOT] Tìm thấy khung giờ chính xác: ${exactMatch.time}`);
        return exactMatch;
      }
      
      // Sắp xếp templates theo thời gian tăng dần
      const sortedTemplates = [...templates].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
      
      // Tìm khung giờ tiếp theo sau thời gian yêu cầu
      let nextSlot = null;
      for (const tpl of sortedTemplates) {
        const tplMinutes = toMinutes(tpl.time);
        if (tplMinutes > target) {
          nextSlot = tpl;
          console.log(`✅ [SLOT] Tìm thấy khung giờ tiếp theo: ${tpl.time} (sau ${tplMinutes - target} phút)`);
          break; // Lấy khung giờ đầu tiên sau thời gian hiện tại
        }
      }
      
      // Nếu không có khung giờ nào sau thời gian hiện tại, trả về null (hết khung giờ)
      if (!nextSlot) {
        console.log(`❌ [SLOT] Không tìm thấy khung giờ nào sau ${formattedCurrentTime}, đã hết khung giờ đặt khám`);
        return null;
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

    console.log(`🔍 [SLOT] Tìm khung giờ mẫu ${exam_time}: ${template ? 'Tìm thấy' : 'Không tìm thấy'}`);
    
    // Trước hết, kiểm tra xem phòng này đã có slots nào trong ngày chưa
    const existingSlotsForRoom = await ScheduleSlot.find({
      date: exam_date,
      IdPhongKham: IdPhongKham,
      is_active: true
    }).lean();
    
    console.log(`🔍 [SLOT] Phòng ${IdPhongKham} có ${existingSlotsForRoom.length} slots trong ngày`);
    
    // ✅ Logic xử lý theo role
    if (!template) {
      if (role === 'receptionist') {
        // Receptionist: Tự động tìm khung giờ tiếp theo
        const foundTemplate = findNextAvailableSlot(exam_time, allTemplates);
        if (!foundTemplate) {
          throw new Error('Đã hết khung giờ đặt khám trong ngày. Vui lòng chọn ngày khác.');
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
        IdPhongKham: IdPhongKham, 
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
      IdPhongKham: IdPhongKham
    }).lean();
    
    console.log(`🔍 [SLOT] Tìm thấy ${existingSlots.length} slots khớp với khung giờ và phòng khám`);
    console.log(`🔍 [SLOT] Các khung giờ cần kiểm tra: ${slotsToCheck.map(s => s.timeSlot).join(', ')}`);
    
    // Nếu không tìm thấy slots nào cho phòng này, có thể cần tạo mới cho tất cả khung giờ mẫu
    if (existingSlots.length === 0 && existingSlotsForRoom.length === 0 && role === 'receptionist') {
      console.log(`🔍 [SLOT] Phòng mới - tạo slot đầu tiên cho phòng ${IdPhongKham}`);
      try {
        slot = await ScheduleSlot.create({
          date: exam_date,
          timeSlot: adjustedTime,
          IdPhongKham: IdPhongKham,
          capacity: template.capacity,
          currentCount: 1,
          is_active: true
        });
        // Tạo thành công, trả về kết quả luôn
        return {
          slot,
          adjustedTime
        };
      } catch (err) {
        if (err.code !== 11000) { // Bỏ qua lỗi duplicate key
          throw err;
        }
        // Nếu trùng key, tiếp tục logic dưới đây
      }
    }

    // Tìm slot có thể sử dụng
    for (const slotInfo of slotsToCheck) {
      const existingSlot = existingSlots.find(s => s.timeSlot === slotInfo.timeSlot);
      console.log(`🔍 [SLOT] Kiểm tra slot ${slotInfo.timeSlot}: ${existingSlot ? `Đã tồn tại (${existingSlot.currentCount}/${existingSlot.capacity})` : 'Chưa tồn tại'}`);

      // Nếu slot chưa tồn tại, tạo mới
      if (!existingSlot) {
        try {
          console.log(`🔍 [SLOT] Tạo mới slot cho phòng ${IdPhongKham}, giờ ${slotInfo.timeSlot}`);
          slot = await ScheduleSlot.create({
            date: exam_date,
            timeSlot: slotInfo.timeSlot,
            IdPhongKham: slotInfo.IdPhongKham,
            capacity: slotInfo.template.capacity,
            currentCount: 1,
            is_active: true
          });
          adjustedTime = slotInfo.timeSlot;
          break;
        } catch (err) {
          console.log(`❌ [SLOT] Lỗi khi tạo slot: ${err.message}, code: ${err.code}`);
          if (err.code === 11000) continue;
          throw err;
        }
      }

      // Nếu slot còn chỗ trống
      if (existingSlot && existingSlot.currentCount < existingSlot.capacity) {
        console.log(`🔍 [SLOT] Cập nhật slot hiện có: ${existingSlot.timeSlot}, count: ${existingSlot.currentCount} -> ${existingSlot.currentCount + 1}`);
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
      console.log(`❌ [SLOT] Không tìm thấy slot phù hợp cho phòng ${IdPhongKham} sau khi kiểm tra tất cả khung giờ`);
      throw new Error('Không tìm thấy khung giờ trống nào trong ngày');
    }

    console.log(`✅ [SLOT] Tìm thấy slot phù hợp: phòng ${IdPhongKham}, giờ ${adjustedTime}, slot ID: ${slot._id}`);
    return {
      slot,
      adjustedTime
    };
  }

  // === Tạo lịch khám với order number logic fixed ===
  async createExam(data) {
    // Sử dụng IdPhongKham cho slot và queue logic
    const { slot, adjustedTime } = await this.getOrCreateSlot(data.exam_date, data.exam_time, data.IdPhongKham, data.role);

    // Cập nhật lại giờ khám nếu có điều chỉnh
    data.exam_time = adjustedTime;
    data.status = data.role === 'receptionist' ? 'accept' : 'pending';
    data.slotId = slot._id;
    data.IdPhongKham = slot.IdPhongKham;

    // Lấy order number TRƯỚC khi tạo exam nếu status là accept
    if (data.status === 'accept') {
      // Format ngày đúng
      const examDate = new Date(data.exam_date);
      console.log(`🔢 [CREATE_EXAM] Tạo lịch khám mới cho ngày: ${examDate.toLocaleDateString()} với status: ${data.status}`);
      
      const maxOrder = await healthInsuranceExamRepository.findMaxOrderNumber(examDate);
      data.order_number = maxOrder + 1;
      console.log(`🔢 [CREATE_EXAM] Gán số thứ tự: ${data.order_number} cho lịch khám mới`);
    }

    // Parallel operations sau khi đã có order_number
    const [exam, phongKhamObj] = await Promise.all([
      healthInsuranceExamRepository.create(data),
      (async () => {
        const PhongKham = (await import('../../models/phong-kham.model.js')).default;
        return PhongKham.findOne({ _id: data.IdPhongKham }, 'ten').lean();
      })()
    ]);

    // Nếu status là accept (role là receptionist), đẩy ngay lên HIS và đợi kết quả
    if (data.status === 'accept') {
      console.log('🏥 [HIS] Đẩy dữ liệu lên HIS cho bản ghi có status accept');
      
      // Đợi kết quả từ HIS
      const hisResult = await this.pushToHIS(exam);
      
      // Nếu không thành công, trả về lỗi
      if (!hisResult.success) {
        // Lấy thông tin lỗi chi tiết từ kết quả
        const errorDetails = hisResult.details && Object.keys(hisResult.details).length > 0 
          ? JSON.stringify(hisResult.details) 
          : hisResult.error;
        
        throw new Error(`Không thể đẩy dữ liệu lên HIS: ${errorDetails}`);
      }
      
      console.log('✅ [HIS] Đẩy dữ liệu lên HIS thành công');
    }

    const encodedId = Buffer.from(exam._id.toString()).toString('base64');
    const qrImageBase64 = await QRCode.toDataURL(encodedId);

    return {
      exam: {
        ...exam.toObject(),
        IdPhongKham: exam.IdPhongKham, // id
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
      
      console.log(`🔢 [CHECK_EXAM] Cập nhật status thành accept cho lịch khám ID: ${exam._id}`);
      console.log(`🔢 [CHECK_EXAM] Tìm số thứ tự tiếp theo cho ngày: ${today.toLocaleDateString()}`);
      
      const maxOrder = await healthInsuranceExamRepository.findMaxOrderNumber(today);
      const newOrderNumber = maxOrder + 1;
      
      console.log(`🔢 [CHECK_EXAM] Gán số thứ tự: ${newOrderNumber} cho lịch khám`);
      
      // Update exam với order number và status
      const updatedExam = await healthInsuranceExamRepository.updateOrderNumber(exam._id, newOrderNumber, 'accept');
      
      // Cập nhật object exam để trả về đúng
      exam.status = 'accept';
      exam.order_number = newOrderNumber;
      
      // Đẩy lên HIS ngay sau khi update status thành accept và đợi kết quả
      console.log('🏥 [HIS] Đẩy dữ liệu lên HIS sau khi update status');
      const hisResult = await this.pushToHIS(updatedExam);
      
      if (!hisResult.success) {
        // Log lỗi nhưng vẫn cho phép check-in thành công vì đã cập nhật status và order_number
        console.error('❌ [HIS] Lỗi khi đẩy dữ liệu lên HIS sau khi update status:', 
          hisResult.details ? JSON.stringify(hisResult.details) : hisResult.error);
        
        // Vẫn cho phép check-in thành công nhưng thêm thông tin lỗi
        return { 
          valid: true, 
          message: 'Lịch khám hợp lệ, check-in thành công. Lưu ý: Không thể đồng bộ với HIS.', 
          exam,
          warning: 'Không thể đồng bộ dữ liệu với HIS. Vui lòng kiểm tra lại sau.'
        };
      }
    }

    return { valid: true, message: 'Lịch khám hợp lệ, check-in thành công', exam };
  }

  // Cache token HIS
  hisTokenCache = {
    access_token: null,
    expiresAt: null
  }

  // === Lấy token HIS với caching ===
  async getHISToken() {
    console.log('🔑 [HIS] Kiểm tra token HIS');
    
    // Kiểm tra token cache còn hạn không
    if (this.hisTokenCache.access_token && 
        this.hisTokenCache.expiresAt > Date.now()) {
      console.log('🔑 [HIS] Sử dụng token HIS đã cache');
      return this.hisTokenCache.access_token;
    }
    
    try {
      const { API_LOGIN_HIS_333, HIS_ACCOUNT, HIS_PASSWORD, CLIENT_ID_HIS } = process.env;
      
      if (!API_LOGIN_HIS_333 || !HIS_ACCOUNT || !HIS_PASSWORD) {
        throw new Error('Thiếu thông tin cấu hình kết nối HIS');
      }
      
      console.log('🔑 [HIS] Đang lấy token mới từ:', API_LOGIN_HIS_333);
      
      // Tạo params theo định dạng form-urlencoded
      const params = new URLSearchParams();
      params.append('client_id', CLIENT_ID_HIS);
      params.append('grant_type', 'password');
      params.append('username', HIS_ACCOUNT);
      params.append('password', HIS_PASSWORD);
            
      // Headers cho form-urlencoded
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };
    

      // Gửi request với params và agent
      const response = await axios.post(API_LOGIN_HIS_333, params, { headers, httpsAgent: this.agent});
      
      
      console.log('✅ [HIS] Nhận phản hồi từ server HIS:', response.status);
      
      if (!response.data || !response.data.access_token) {
        console.error('❌ [HIS] Phản hồi không có access_token:', response.data);
        throw new Error('Không nhận được access_token từ HIS');
      }
      
      // Cache token với thời hạn - giảm 60s để đảm bảo an toàn
      const expiresIn = response.data.expires_in || 3600; // Mặc định 1 giờ nếu không có
      this.hisTokenCache = {
        access_token: response.data.access_token,
        expiresAt: Date.now() + (expiresIn - 60) * 1000
      };
      
      console.log('🔑 [HIS] Đã lấy được token HIS mới, hết hạn sau:', expiresIn, 'giây');
      return this.hisTokenCache.access_token;
      
    } catch (error) {
      console.error('❌ [HIS] Lỗi khi lấy token HIS:', error.message);
      throw new Error(`Không thể lấy token HIS: ${error.message}`);
    }
  }
  async pushToHIS(exam) {
    console.log('🏥 [HIS] Đẩy thông tin lên HIS:', exam._id);
    try {
      // 1. Lấy token trước khi gọi API
      const token = await this.getHISToken();
      
      // 2. Lấy API URL từ biến môi trường
      const { API_PUSH_TO_HIS_333 } = process.env;
      if (!API_PUSH_TO_HIS_333) {
        throw new Error('Thiếu cấu hình API_PUSH_TO_HIS_333');
      }
      
      console.log('🏥 [HIS] Chuẩn bị dữ liệu để gửi lên HIS');
      
      // Định dạng ngày giờ cho tất cả các trường ngày tháng
      // FORMAT: HH:MM mm/dd/yyyy (giờ:phút tháng/ngày/năm) theo yêu cầu API HIS
      // Ngày sinh chỉ cần dạng mm/dd/yyyy (không cần giờ)
      
      // Lấy phòng khám
      const PhongKham = (await import('../../models/phong-kham.model.js')).default;
      const clinic = await PhongKham.findById(exam.IdPhongKham).lean();
      
      // Lấy thông tin BHYT từ cache nếu có và chỉ khi type là BHYT
      let dmBHYT = null;
      
      // Lưu BHYT và CCCD keys để xử lý cache sau khi push lên HIS
      const bhytKey = exam.BHYT;
      const cccdKey = exam.CCCD;
      
      // Chỉ tìm thông tin BHYT khi exam_type là 'BHYT'
      if (exam.exam_type === 'BHYT') {
        // Log thông tin về cache BHYT hiện tại
        console.log('🔍 [BHYT_CACHE] Thông tin cache BHYT hiện tại:');
        console.log('   - Tổng số cache:', Object.keys(this.bhytResultCache).length);
        console.log('   - Các khóa có trong cache:', Object.keys(this.bhytResultCache));
        
        console.log('   - Đang tìm mã thẻ BHYT:', bhytKey);
        console.log('   - Đang tìm mã CCCD:', cccdKey);
        console.log('   - BHYT có tồn tại trong cache:', !!this.bhytResultCache[bhytKey]);
        console.log('   - CCCD có tồn tại trong cache:', !!this.bhytResultCache[cccdKey]);
        
        // Kiểm tra trường BHYT trước
        if (bhytKey && this.bhytResultCache[bhytKey]) {
          try {
            // Lấy dữ liệu từ cache và đảm bảo nó là đối tượng hợp lệ
            const cachedData = this.bhytResultCache[bhytKey];
            
            console.log('🔍 [BHYT_CACHE] Dữ liệu cache tìm thấy từ BHYT:', JSON.stringify(cachedData, null, 2));
            
            // Kiểm tra xem dữ liệu có phải là đối tượng và có thuộc tính cần thiết không
            if (cachedData && typeof cachedData === 'object' && cachedData.SoBHYT && cachedData.HoVaTen) {
              dmBHYT = cachedData;
              console.log('🏥 [HIS] Sử dụng thông tin BHYT từ cache (mã BHYT):', bhytKey);
            } else {
              console.warn('🏥 [HIS] Dữ liệu BHYT cache không đúng định dạng, bỏ qua');
              console.warn('🏥 [HIS] Chi tiết dữ liệu:', 
                cachedData ? `Loại: ${typeof cachedData}, Có SoBHYT: ${!!cachedData.SoBHYT}, Có HoVaTen: ${!!cachedData.HoVaTen}` : 'null');
            }
          } catch (error) {
            console.error('❌ [HIS] Lỗi khi xử lý dữ liệu BHYT từ cache (mã BHYT):', error.message);
          }
        } 
        
        // Nếu không tìm thấy từ BHYT, thử tìm từ CCCD
        if (!dmBHYT && cccdKey && this.bhytResultCache[cccdKey]) {
          try {
            // Lấy dữ liệu từ cache và đảm bảo nó là đối tượng hợp lệ
            const cachedData = this.bhytResultCache[cccdKey];
            
            console.log('🔍 [BHYT_CACHE] Dữ liệu cache tìm thấy từ CCCD:', JSON.stringify(cachedData, null, 2));
            
            // Kiểm tra xem dữ liệu có phải là đối tượng và có thuộc tính cần thiết không
            if (cachedData && typeof cachedData === 'object' && cachedData.SoBHYT && cachedData.HoVaTen) {
              dmBHYT = cachedData;
              console.log('🏥 [HIS] Sử dụng thông tin BHYT từ cache (mã CCCD):', cccdKey);
            } else {
              console.warn('🏥 [HIS] Dữ liệu BHYT cache từ CCCD không đúng định dạng, bỏ qua');
            }
          } catch (error) {
            console.error('❌ [HIS] Lỗi khi xử lý dữ liệu BHYT từ cache (mã CCCD):', error.message);
          }
        }
        
        // Nếu vẫn không tìm thấy, log thông báo
        if (!dmBHYT && (bhytKey || cccdKey)) {
          console.log('🏥 [HIS] Không tìm thấy thông tin BHYT trong cache cho cả BHYT và CCCD');
          console.log('🏥 [HIS] Các mã thẻ hiện có trong cache:', Object.keys(this.bhytResultCache).join(', ') || 'Không có');
        }
      } else {
        console.log('🏥 [HIS] Không tìm thông tin BHYT vì exam_type là:', exam.exam_type);
      }
      
      // 4. Cấu trúc dữ liệu theo yêu cầu của API HIS
      const basePayload = {
        GioiTinh: exam.GioiTinh === 'Nam',
        IdDanToc: exam.IdDanToc,
        TenDanToc: exam.TenDanToc,
        IdQuocTich: exam.IdQuocTich,
        MaDoiTuongKCB: exam.exam_type === 'BHYT' ? "3.3" : "9",
        MaTinh: exam.MaTinh,
        TenTinh: exam.TenTinh,
        IdTinhThanh: exam.IdTinhThanh,
        IdXaPhuong: exam.IdXaPhuong,
        IdBenhVien: process.env.ID_BENHVIEN_HIS,
        IdKhoaKham: exam.IdKhoaKham,
        IsDonTiepCCCD: !!exam.CCCD,
        CMNDNoiCap: process.env.NOI_CAP_CCCD_HIS,
        CMNDNgayCap: this.formatDisplayDateTime(exam.CMNDNgayCap, false),
        IsMSTCaNhan: true,
        MaXa: exam.MaXa,
        TenXa: exam.TenXa,
        MaPhongKham: exam.MaPhongKham,
        TenPhongKham: exam.TenPhongKham,
        IdPhongKham: exam.IdPhongKham,
        IdLoaiKham: exam.IdLoaiKham,
        HoTen: exam.HoTen,
        DienThoai: exam.DienThoai,
        SoNha: exam.SoNha,
        IdNgheNghiep: exam.IdNgheNghiep,
        TenNgheNghiep: exam.TenNgheNghiep || "Khác",
        NgaySinh: this.formatDisplayDateTime(exam.NgaySinh, false),
        DiaChi: exam.DiaChi,
        IdCanBoDonTiep: process.env.ID_CANBO_HIS||"3923362b-5ec4-4d11-ae0f-684001f67748",
        IdCongKhamBanDau: exam.IdCongKhamBanDau,
        NgayKham: this.formatDisplayDateTime(new Date()),
        NgayDonTiep: this.formatDisplayDateTime(new Date()),
        Status: 0
      };
      
      // Nếu là BHYT, thêm các trường bổ sung
      const payload = exam.exam_type === 'BHYT' 
        ? {
            ...basePayload,
            // Thông tin BHYT chỉ được thêm khi có dữ liệu hợp lệ
            ...(dmBHYT && { DmBHYT: dmBHYT }),
            // Thêm các trường bắt buộc cho BHYT
            IsBHYT: !!dmBHYT,
            IsDungTuyen: !!dmBHYT,
            SoBHYT: dmBHYT ? dmBHYT.SoBHYT : exam.SoBHYT,
            CMND: exam.CCCD,
            
          }
        : basePayload; // Nếu là DV, chỉ dùng các trường cơ bản
      
      // Log đầy đủ payload để debug
      console.log('🏥 [HIS] Chi tiết payload gửi lên HIS:', JSON.stringify(payload, null, 2));
      
      
      // 5. Gọi API với token trong header và timeout hợp lý
      const response = await axios.post(API_PUSH_TO_HIS_333, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
          
        },
        httpsAgent: this.agent,
        timeout: 30000 // Timeout 30s
      });
      
      // Kiểm tra response có đúng định dạng không
      console.log('✅ [HIS] Phản hồi từ API HIS:', response.status, response.statusText);
      console.log('✅ [HIS] Data phản hồi:', JSON.stringify(response.data, null, 2));
      
      // Kiểm tra nếu response có chứa mã lỗi nội bộ từ API
      if (response.data && response.data.statusCode && response.data.statusCode !== 200) {
        console.error('❌ [HIS] API trả về mã lỗi:', response.data.statusCode);
        return {
          success: false,
          error: `API HIS trả về mã lỗi: ${response.data.statusCode}`,
          details: response.data
        };
      }
      
      // Kiểm tra các trường bắt buộc trong response
      if (!response.data || (typeof response.data === 'object' && Object.keys(response.data).length === 0)) {
        console.error('❌ [HIS] API trả về dữ liệu rỗng');
        return {
          success: false,
          error: 'API HIS trả về dữ liệu rỗng',
          details: response.data
        };
      }
      
      console.log('✅ [HIS] Đẩy thông tin lên HIS thành công:', exam._id);
      
      // 6. Trả về kết quả
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // Log lỗi chi tiết
      console.error(`❌ [HIS] Lỗi: ${error.message} | Bệnh nhân: ${exam.HoTen} (ID: ${exam._id})`);
      
      // Phân loại lỗi để dễ debug
      if (error.code === 'ECONNABORTED') {
        console.error('❌ [HIS] Lỗi timeout khi kết nối đến API HIS');
        return {
          success: false,
          error: 'Kết nối đến HIS bị timeout',
          errorCode: 'TIMEOUT',
          details: { message: error.message }
        };
      }
      
      // Lỗi network
      if (!error.response) {
        console.error('❌ [HIS] Lỗi kết nối mạng:', error.message);
        return {
          success: false,
          error: 'Không thể kết nối đến HIS',
          errorCode: 'NETWORK',
          details: { message: error.message }
        };
      }
      
      // Lỗi response từ server
      if (error.response) {
        console.error('❌ [HIS] Mã lỗi từ server:', error.response.status);
        console.error('❌ [HIS] Data lỗi:', JSON.stringify(error.response.data, null, 2));
        
        // Phân loại theo mã HTTP
        if (error.response.status === 401) {
          return {
            success: false,
            error: 'Token xác thực không hợp lệ',
            errorCode: 'AUTH',
            details: error.response.data || {}
          };
        } else if (error.response.status === 400) {
          return {
            success: false,
            error: 'Dữ liệu gửi đi không hợp lệ',
            errorCode: 'BAD_REQUEST',
            details: error.response.data || {}
          };
        } else {
          return {
            success: false,
            error: `Lỗi server HIS (${error.response.status})`,
            errorCode: 'SERVER',
            details: error.response.data || {}
          };
        }
      }
      
      // Lỗi không xác định
      return {
        success: false,
        error: error.message,
        errorCode: 'UNKNOWN',
        details: {}
      };
    } finally {
      // Xóa cache BHYT sau khi đẩy lên HIS (thành công hoặc thất bại)
      const bhytKey = exam.BHYT;
      const cccdKey = exam.CCCD;
      
      if (bhytKey || cccdKey) {
        if (bhytKey && this.bhytResultCache[bhytKey]) {
          delete this.bhytResultCache[bhytKey];
          console.log('🧹 [BHYT_CACHE] Đã xóa cache BHYT sau khi push lên HIS:', bhytKey);
        }
        
        if (cccdKey && this.bhytResultCache[cccdKey]) {
          delete this.bhytResultCache[cccdKey];
          console.log('🧹 [BHYT_CACHE] Đã xóa cache CCCD sau khi push lên HIS:', cccdKey);
        }
        
        console.log('🧹 [BHYT_CACHE] Số lượng mã thẻ còn lại trong cache:', Object.keys(this.bhytResultCache).length);
      }
    }
  }

  // === Lấy tất cả lịch khám với phân trang ===
  async getAllExams(options = {}) {
    console.log('🔍 [EXAM_SERVICE] Lấy danh sách lịch khám với options:', options);
    
    try {
      // Xử lý các tham số đầu vào
      const queryOptions = {
        page: options.page ? parseInt(options.page) : 1, // Mặc định trang 1
        limit: options.limit ? parseInt(options.limit) : 10, // Mặc định 10 bản ghi/trang
        sortBy: options.sortBy || 'createdAt', // Mặc định sắp xếp theo ngày tạo
        sortOrder: -1, // Luôn sắp xếp từ mới đến cũ (giảm dần)
        filters: {}
      };
      
      // Xử lý các filter từ query params
      if (options.status) queryOptions.filters.status = options.status;
      if (options.exam_type) queryOptions.filters.exam_type = options.exam_type;
      if (options.IdPhongKham) queryOptions.filters.IdPhongKham = options.IdPhongKham;
      
      // Xử lý tìm kiếm theo ngày khám
      if (options.exam_date) {
        const examDate = new Date(options.exam_date);
        if (!isNaN(examDate.getTime())) {
          // Tạo khoảng thời gian cho ngày (từ 00:00 đến 23:59:59)
          const startDate = new Date(examDate);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(examDate);
          endDate.setHours(23, 59, 59, 999);
          
          queryOptions.filters.exam_date = { $gte: startDate, $lte: endDate };
        }
      }
      
      // Gọi repository để lấy dữ liệu - trả về tất cả các trường trong model nguyên bản
      const result = await healthInsuranceExamRepository.findAll(queryOptions);
      
      console.log(`✅ [EXAM_SERVICE] Lấy thành công ${result.data.length}/${result.total} lịch khám`);
      return result;
      
    } catch (error) {
      console.error('❌ [EXAM_SERVICE] Lỗi khi lấy danh sách lịch khám:', error.message);
      throw new Error(`Không thể lấy danh sách lịch khám: ${error.message}`);
    }
  }
  
  // Helper method để thêm thông tin phòng khám vào danh sách lịch khám
  // === Cập nhật thông tin lịch khám ===
  async updateExam(id, data) {
    console.log('🔄 [EXAM_SERVICE] Cập nhật lịch khám:', id);
    
    try {
      // Kiểm tra xem lịch khám có tồn tại không
      const exam = await healthInsuranceExamRepository.findById(id);
      if (!exam) {
        throw new Error('Không tìm thấy lịch khám');
      }
      
      // Loại bỏ các trường không được phép cập nhật
      const allowedUpdates = { 
        ...data 
      };
      
      // Không cho phép thay đổi một số trường quan trọng
      delete allowedUpdates._id;
      delete allowedUpdates.is_deleted;
      delete allowedUpdates.created_at;
      delete allowedUpdates.updated_at;
      
      // Cập nhật lịch khám
      const updatedExam = await healthInsuranceExamRepository.update(id, allowedUpdates);
      
      console.log('✅ [EXAM_SERVICE] Cập nhật lịch khám thành công:', id);
      return updatedExam;
    } catch (error) {
      console.error('❌ [EXAM_SERVICE] Lỗi khi cập nhật lịch khám:', error.message);
      throw new Error(`Không thể cập nhật lịch khám: ${error.message}`);
    }
  }
  
  // === Xóa lịch khám ===
  async deleteExam(id) {
    console.log('🗑️ [EXAM_SERVICE] Xóa lịch khám:', id);
    
    try {
      // Kiểm tra xem lịch khám có tồn tại không
      const exam = await healthInsuranceExamRepository.findById(id);
      if (!exam) {
        throw new Error('Không tìm thấy lịch khám');
      }
      
      // Xóa lịch khám (soft delete)
      await healthInsuranceExamRepository.remove(id);
      
      console.log('✅ [EXAM_SERVICE] Xóa lịch khám thành công:', id);
      return { success: true, message: 'Xóa lịch khám thành công' };
    } catch (error) {
      console.error('❌ [EXAM_SERVICE] Lỗi khi xóa lịch khám:', error.message);
      throw new Error(`Không thể xóa lịch khám: ${error.message}`);
    }
  }
}

export default new HealthInsuranceExamService();
