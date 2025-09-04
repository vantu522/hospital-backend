import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';
import axios from 'axios';
import QRCode from 'qrcode';

class HealthInsuranceExamService {
  // Lock để đồng bộ lấy token mới khi gặp lỗi 401
  bhytTokenLock = false;
  // Cache token/id_token cho BHYT
  bhytTokenCache = { token: null, id_token: null };

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

  // === Lấy token BHYT, chỉ refresh khi cần ===
  async getBHYTToken() {
    while (this.bhytTokenLock) await new Promise(r => setTimeout(r, 100));
    if (this.bhytTokenCache.token && this.bhytTokenCache.id_token) return this.bhytTokenCache;

    this.bhytTokenLock = true;
    const { BHYT_USERNAME: username, BHYT_PASSWORD: password, BHYT_TOKEN_URL: url } = process.env;

    const tokenRes = await this.safePost(url, { username, password });
    const apiKey = tokenRes.data.APIKey || {};
    this.bhytTokenCache = { token: apiKey.access_token || '', id_token: apiKey.id_token || '' };
    this.bhytTokenLock = false;

    return this.bhytTokenCache;
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
        this.bhytTokenCache = { token: null, id_token: null };
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

  // === Tạo hoặc lấy slot gần nhất nếu cần ===
  async getOrCreateSlot(exam_date, exam_time, clinicRoom, role) {
    const ScheduleSlot = (await import('../../models/schedule-slot.model.js')).default;
    const TimeSlotTemplate = (await import('../../models/time-slot-template.model.js')).default;
    
    let template = await TimeSlotTemplate.findOne({ time: exam_time, is_active: true });
    let adjustedTime = exam_time;
    
    // Nếu không tìm thấy template và là receptionist, tìm khung giờ tiếp theo
    if (!template && role === 'receptionist') {
      console.log('[Schedule] Tìm khung giờ tiếp theo cho:', exam_time);
      const templates = await TimeSlotTemplate.find({ is_active: true }).lean();
      
      if (templates.length === 0) {
        throw new Error('Không có khung giờ mẫu nào đang hoạt động');
      }

      const toMinutes = t => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const target = toMinutes(exam_time);
      
      // Tìm khung giờ tiếp theo (sau thời gian yêu cầu)
      const nextSlots = templates
        .filter(tpl => toMinutes(tpl.time) > target)
        .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
      
      console.log('[Schedule] Tìm khung giờ cho:', exam_time);
      console.log('[Schedule] Các khung giờ sau thời gian yêu cầu:', nextSlots.map(t => t.time));

      // Nếu không có khung giờ nào sau thời gian yêu cầu, lấy khung giờ đầu tiên của ngày hôm sau
      if (nextSlots.length === 0) {
        const firstSlot = templates.sort((a, b) => toMinutes(a.time) - toMinutes(b.time))[0];
        template = firstSlot;
        adjustedTime = template.time;
        console.log('[Schedule] Không có khung giờ nào sau thời gian yêu cầu, chọn khung giờ đầu tiên:', adjustedTime);
      } else {
        template = nextSlots[0];
        adjustedTime = template.time;
        console.log('[Schedule] Đã điều chỉnh giờ khám thành khung giờ tiếp theo:', {
          from: exam_time,
          to: adjustedTime
        });
      }
    } else if (!template) {
      throw new Error('Không tìm thấy khung giờ mẫu phù hợp');
    }

    // Tìm hoặc tạo slot với giờ đã điều chỉnh
    let slot = await ScheduleSlot.findOne({ 
      date: exam_date, 
      timeSlot: adjustedTime, 
      clinicRoom 
    });

    if (!slot) {
      slot = await ScheduleSlot.create({
        date: exam_date,
        timeSlot: adjustedTime,
        clinicRoom,
        capacity: template.capacity,
        currentCount: 1,
        is_active: true
      });
      console.log('[Schedule] Tạo slot mới:', {
        date: exam_date,
        time: adjustedTime,
        capacity: template.capacity
      });
    } else {
      if (slot.currentCount >= slot.capacity) {
        throw new Error('Slot đã đầy, vui lòng chọn khung giờ khác');
      }
      slot.currentCount += 1;
      await slot.save();
    }

    return {
      slot,
      adjustedTime
    };
  }

  // === Tạo lịch khám ===
  async createExam(data) {
    const { slot, adjustedTime } = await this.getOrCreateSlot(data.exam_date, data.exam_time, data.clinicRoom, data.role);
    
    // Cập nhật lại giờ khám nếu có điều chỉnh
    data.exam_time = adjustedTime;
    data.status = data.role === 'receptionist' ? 'accept' : 'pending';
    data.slotId = slot._id;
    data.clinicRoom = slot.clinicRoom;

    if (data.status === 'accept') {
      const HealthInsuranceExam = (await import('../../models/health-insurance-exam.model.js')).default;
      const maxOrder = await HealthInsuranceExam.findOne({}, {}, { sort: { order_number: -1 } });
      data.order_number = maxOrder?.order_number ? maxOrder.order_number+1 : 1;
    }

    const exam = await healthInsuranceExamRepository.create(data);
    const ClinicRoom = (await import('../../models/clinic-room.model.js')).default;
    const clinicRoomObj = await ClinicRoom.findById(exam.clinicRoom).lean();

    const encodedId = Buffer.from(exam._id.toString()).toString('base64');
    const qrImageBase64 = await QRCode.toDataURL(encodedId);

    return {
      exam: { ...exam.toObject(), clinicRoom: clinicRoomObj?.name || '' },
      qr_code: qrImageBase64,
      encoded_id: encodedId
    };
  }

  // === Check lịch khám theo QR code ===
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
      exam.status = 'reject'; await exam.save();
      return { valid: false, message: 'Lịch khám bị hủy do tới trễ quá 15 phút', exam };
    }

    if (exam.status !== 'accept') {
      exam.status = 'accept';
      const HealthInsuranceExam = (await import('../models/health-insurance-exam.model.js')).default;
      const maxOrder = await HealthInsuranceExam.findOne({}, {}, { sort: { order_number: -1 } });
      exam.order_number = maxOrder?.order_number ? maxOrder.order_number+1 : 1;
      await exam.save();
    }

    return { valid: true, message: 'Lịch khám hợp lệ, check-in thành công', exam };
  }

  // === Push lên HIS (placeholder) ===
  async pushToHIS(exam) {
    console.log('Đẩy thông tin lên HIS:', exam._id);
  }
}

export default new HealthInsuranceExamService();
