import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';
import axios from 'axios';
import QRCode from 'qrcode';

class HealthInsuranceExamService {
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
          console.warn(`[BHYT] Lỗi mạng (${err.code || err.message}), retry ${attempt}/${maxRetry}`);
          lastError = err;
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  // === Lấy token BHYT với TTL cache (30 phút) ===
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
      
      // Cache với TTL 30 phút
      this.bhytTokenCache = { 
        token: apiKey.access_token || '', 
        id_token: apiKey.id_token || '',
        expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
      };
      
      return this.bhytTokenCache;
    } finally {
      this.bhytTokenLock = false;
    }
  }

  // === Kiểm tra thẻ BHYT với cơ chế refresh token khi gặp 401 ===
  async checkBHYTCard({ maThe, hoTen, ngaySinh }) {
    const { BHYT_USERNAME: username, BHYT_PASSWORD: password, BHYT_HOTENCB: hoTenCb, BHYT_CCCDCB: cccdCb, BHYT_CHECK_URL: bhytCheckUrl } = process.env;
    let { token, id_token } = await this.getBHYTToken();
    const body = { maThe, hoTen, ngaySinh, hoTenCb, cccdCb };

    const requestAPI = async () => {
      const url = `${bhytCheckUrl}?id_token=${id_token}&password=${password}&token=${token}&username=${username}`;
      return await this.safePost(url, body);
    };

    try {
      let response = await requestAPI();

      if (response.data?.maKetQua === "401") {
        console.log('[BHYT] Token sai/hết hạn, lấy token mới...');
        this.bhytTokenCache = { token: null, id_token: null, expiresAt: null };
        ({ token, id_token } = await this.getBHYTToken());
        await new Promise(r => setTimeout(r, 1000));
        response = await requestAPI();

        if (response.data?.maKetQua === "401") {
          return { success: false, message: response.data.ghiChu || "Token không đúng.", code: "401", data: response.data };
        }
      }

      return { success: true, data: response.data };
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
  async getOrCreateSlot(exam_date, exam_time, clinicRoom, role) {
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
      
      // Nếu không có khung giờ nào sau, lấy khung giờ đầu tiên
      if (!nextSlot) {
        let earliestSlot = templates[0];
        let earliestTime = toMinutes(templates[0].time);
        
        for (let i = 1; i < templates.length; i++) {
          const currentTime = toMinutes(templates[i].time);
          if (currentTime < earliestTime) {
            earliestTime = currentTime;
            earliestSlot = templates[i];
          }
        }
        return earliestSlot;
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

    // Nếu không tìm thấy template và là receptionist, tìm khung giờ tiếp theo
    if (!template && role === 'receptionist') {
      const foundTemplate = findNextAvailableSlot(exam_time, allTemplates);
      if (!foundTemplate) {
        throw new Error('Không tìm thấy khung giờ mẫu nào phù hợp');
      }
      template = foundTemplate;
      adjustedTime = template.time;
    } else if (!template) {
      throw new Error('Không tìm thấy khung giờ mẫu phù hợp');
    }

    // Logic tự động tìm slot trống cho receptionist - batch check
    let slot = null;
    let attempts = 0;
    const maxAttempts = 5; // Giảm số lần thử từ 10 xuống 5
    
    // Pre-check 5 slots cùng lúc để tối ưu
    const slotsToCheck = [];
    let currentTime = adjustedTime;
    let currentTemplate = template;
    
    for (let i = 0; i < 5; i++) {
      slotsToCheck.push({
        date: exam_date,
        timeSlot: currentTime,
        clinicRoom,
        template: currentTemplate
      });
      
      if (i < 4) { // Không cần tìm tiếp cho lần cuối
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
      clinicRoom
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
            clinicRoom,
            capacity: slotInfo.template.capacity,
            currentCount: 1,
            is_active: true
          });
          adjustedTime = slotInfo.timeSlot;
          break;
        } catch (err) {
          // Nếu có duplicate key error, tiếp tục với slot tiếp theo
          if (err.code === 11000) continue;
          throw err;
        }
      }
      
      // Nếu slot còn chỗ trống
      if (existingSlot.currentCount < existingSlot.capacity) {
        // Atomic update để tránh race condition
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
      
      // Slot đầy - nếu không phải receptionist thì báo lỗi ngay
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
    const { slot, adjustedTime } = await this.getOrCreateSlot(data.exam_date, data.exam_time, data.clinicRoom, data.role);
    
    // Cập nhật lại giờ khám nếu có điều chỉnh
    data.exam_time = adjustedTime;
    data.status = data.role === 'receptionist' ? 'accept' : 'pending';
    data.slotId = slot._id;
    data.clinicRoom = slot.clinicRoom;

    // Lấy order number TRƯỚC khi tạo exam nếu status là accept
    if (data.status === 'accept') {
      const maxOrder = await healthInsuranceExamRepository.findMaxOrderNumber();
      data.order_number = maxOrder + 1;
    }

    // Parallel operations sau khi đã có order_number
    const [exam, clinicRoomObj] = await Promise.all([
      healthInsuranceExamRepository.create(data),
      (async () => {
        const ClinicRoom = (await import('../../models/clinic-room.model.js')).default;
        return ClinicRoom.findById(data.clinicRoom, 'name').lean();
      })()
    ]);

    const encodedId = Buffer.from(exam._id.toString()).toString('base64');
    const qrImageBase64 = await QRCode.toDataURL(encodedId);

    return {
      exam: { ...exam.toObject(), clinicRoom: clinicRoomObj?.name || '' },
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
      // Lấy max order number trước
      const maxOrder = await healthInsuranceExamRepository.findMaxOrderNumber();
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
