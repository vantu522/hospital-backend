import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';
import axios from 'axios';
import QRCode from 'qrcode';

class HealthInsuranceExamService {
  // Lock để đồng bộ lấy token mới khi gặp lỗi 401
  bhytTokenLock = false;
  // Cache token/id_token cho BHYT
  bhytTokenCache = { token: null, id_token: null, expires: 0 };

  async getBHYTToken() {
    // Nếu đang lấy token mới, các request khác sẽ chờ
    while (this.bhytTokenLock) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (this.bhytTokenCache.token && this.bhytTokenCache.id_token) {
      return this.bhytTokenCache;
    }
    this.bhytTokenLock = true;
    const username = process.env.BHYT_USERNAME;
    const password = process.env.BHYT_PASSWORD;
    // Luôn trả về token trong cache, không kiểm tra thời gian hết hạn
    if (this.bhytTokenCache.token && this.bhytTokenCache.id_token) {
      this.bhytTokenLock = false;
      return this.bhytTokenCache;
    }
    // Nếu chưa có token thì gọi API lấy mới
    const bhytTokenUrl = process.env.BHYT_TOKEN_URL;
    const tokenRes = await this.safePost(bhytTokenUrl, {
      username : username,
      password : password
    });
    console.log('[BHYT] Data trả về khi login lấy token:', tokenRes.data);
    const apiKey = tokenRes.data.APIKey || {};
    this.bhytTokenCache = {
      token: apiKey.access_token || '',
      id_token: apiKey.id_token || ''
    };
    this.bhytTokenLock = false;
    return this.bhytTokenCache;
  }

  async safePost(url, body, options = {}, maxRetry = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      try {
        return await axios.post(url, body, {
          timeout: 15000,
          ...options,
        });
      } catch (err) {
        // chỉ retry khi lỗi mạng/timeout/reset
        if (
          err.code === 'ECONNRESET' ||
          err.code === 'ECONNABORTED' ||
          err.message.includes('timeout')
        ) {
          console.warn(
            `[BHYT] Lỗi mạng (${err.code || err.message}), retry ${attempt}/${maxRetry}`
          );
          lastError = err;
          await new Promise((r) => setTimeout(r, 300)); // retry nhanh hơn, mỗi lần chỉ chờ 300ms
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  async checkBHYTCard({ maThe, hoTen, ngaySinh }) {
    const username = process.env.BHYT_USERNAME;
    const password = process.env.BHYT_PASSWORD;
    const hoTenCb = process.env.BHYT_HOTENCB;
    const cccdCb = process.env.BHYT_CCCDCB;
    const axios = (await import('axios')).default;
    console.log('[BHYT] Bắt đầu kiểm tra thẻ:', { maThe, hoTen, ngaySinh });
    let { token, id_token, expires } = await this.getBHYTToken();
    console.log('[BHYT] Token hiện tại:', { token, id_token, expires });
  const bhytCheckUrl = process.env.BHYT_CHECK_URL;
  const checkUrl = `${bhytCheckUrl}?id_token=${id_token}&password=${password}&token=${token}&username=${username}`;
    const body = { maThe, hoTen, ngaySinh, hoTenCb, cccdCb };
    console.log('[BHYT] Gửi request tới API quốc gia:', checkUrl, body);
    try {
  let response = await this.safePost(checkUrl, body);
      console.log('[BHYT] Response lần 1:', response.data);
      if (response.data && response.data.maKetQua === "401") {
        console.log('[BHYT] Token sai/hết hạn, lấy lại token mới...');
        this.bhytTokenCache = { token: null, id_token: null, expires: 0 };
        // Nếu đang lấy token mới, các request khác sẽ chờ
        while (this.bhytTokenLock) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        ({ token, id_token, expires } = await this.getBHYTToken());
        console.log('[BHYT] Token mới:', { token, id_token, expires });
        // Đợi 1s trước khi gọi lại API check BHYT
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryUrl = `${bhytCheckUrl}?id_token=${id_token}&password=${password}&token=${token}&username=${username}`;
        console.log('[BHYT] Gửi lại request với token mới:', retryUrl, body);
  response = await this.safePost(retryUrl, body);
        console.log('[BHYT] Response lần 2:', response.data);
        if (response.data && response.data.maKetQua === "401") {
          console.log('[BHYT] Token vẫn sai sau khi refresh, trả về lỗi.');
          return { success: false, message: response.data.ghiChu || "Token không đúng.", code: "401", data: response.data };
        }
      }
      console.log('[BHYT] Kiểm tra thẻ thành công:', response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.log('[BHYT] Lỗi khi gọi API:', err.message);
      return { success: false, message: err.message };
    }
  }
  
  // Hàm đẩy thông tin lên hệ thống HIS
  async pushToHIS(exam) {
    // TODO: Gọi API hoặc thực hiện logic gửi dữ liệu lên hệ thống HIS của bệnh viện
    // Ví dụ:
    // await axios.post(HIS_API_URL, exam);
    console.log('Đẩy thông tin lên HIS:', exam._id);
    // Trả về kết quả hoặc xử lý lỗi nếu cần
  }
  async createExam(data) {
    // 1. Kiểm tra slot chung theo ngày + khung giờ + chuyên khoa
    const { exam_date, exam_time, specialty, role } = data;
    const ScheduleSlot = (await import('../models/schedule-slot.model.js')).default;
    let slot = await ScheduleSlot.findOne({ date: exam_date, timeSlot: exam_time, specialty });
    // 2. Nếu chưa có slot, sinh slot từ TimeSlotTemplate
    if (!slot) {
      const TimeSlotTemplate = (await import('../models/time-slot-template.model.js')).default;
      const template = await TimeSlotTemplate.findOne({ time: exam_time, is_active: true });
      if (!template) {
        throw new Error('Không tìm thấy khung giờ mẫu phù hợp');
      }
      slot = await ScheduleSlot.create({
        date: exam_date,
        timeSlot: exam_time,
        specialty,
        capacity: template.capacity,
        currentCount: 1,
        is_active: true
      });
    } else {
      // 3. Kiểm tra slot capacity
      if (slot.currentCount >= slot.capacity) {
        throw new Error('Slot đã đầy, vui lòng chọn khung giờ khác');
      }
      slot.currentCount += 1;
      await slot.save();
    }
    // 4. Xác định status theo role
    data.status = role === 'receptionist' ? 'accept' : 'pending';
    // 5. Tạo lịch khám, lưu slotId và loại hình khám
    data.slotId = slot._id;
    // Nếu status là accept, tự động gán order_number tăng dần
    if (data.status === 'accept') {
      const HealthInsuranceExam = (await import('../models/health-insurance-exam.model.js')).default;
      const maxOrder = await HealthInsuranceExam.findOne({}, {}, { sort: { order_number: -1 } });
      data.order_number = maxOrder && maxOrder.order_number ? maxOrder.order_number + 1 : 1;
    }
    const exam = await healthInsuranceExamRepository.create(data);
    // 6. Tạo mã QR code base64 chứa id
    const encodedId = Buffer.from(exam._id.toString()).toString('base64');
    const qrImageBase64 = await QRCode.toDataURL(encodedId);
    return {
      exam,
      qr_code: qrImageBase64,
      encoded_id: encodedId
    };
  }

  async checkExamByEncodedId(encodedId) {
    // Giải mã lấy id
    let id;
    try {
      id = Buffer.from(encodedId, 'base64').toString('utf-8');
    } catch (err) {
      throw new Error('QR code không hợp lệ');
    }
    const exam = await healthInsuranceExamRepository.findById(id);
    if (!exam) {
      throw new Error('Không tìm thấy lịch khám');
    }
    // Kiểm tra thời điểm khám (ngày + giờ)
    const now = new Date();
    const examDate = new Date(exam.exam_date);
    const [examHour, examMinute] = exam.exam_time.split(':').map(Number);
    const examDateTime = new Date(examDate);
    examDateTime.setHours(examHour, examMinute, 0, 0);

    // Nếu chưa tới thời điểm khám
    if (now < examDateTime) {
      return { valid: false, message: 'Chưa tới giờ khám', exam };
    }
    // Nếu đã quá thời điểm khám > 15 phút
    const diffMinutes = (now - examDateTime) / (1000 * 60);
    if (diffMinutes > 15) {
      exam.status = 'reject';
      await exam.save();
      return { valid: false, message: 'Lịch khám bị hủy do tới trễ quá 15 phút', exam };
    }
    // Nếu hợp lệ, đổi status thành accept và gán order_number tự động
    if (exam.status !== 'accept') {
      exam.status = 'accept';
      // Gán order_number tăng dần
      const HealthInsuranceExam = (await import('../models/health-insurance-exam.model.js')).default;
      const maxOrder = await HealthInsuranceExam.findOne({}, {}, { sort: { order_number: -1 } });
      exam.order_number = maxOrder && maxOrder.order_number ? maxOrder.order_number + 1 : 1;
      await exam.save();
    }
    return { valid: true, message: 'Lịch khám hợp lệ, check-in thành công', exam };
  }
}

export default new HealthInsuranceExamService();
