import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';
import axios from 'axios';

import QRCode from 'qrcode';

class HealthInsuranceExamService {
  // Cache token/id_token cho BHYT
  bhytTokenCache = { token: null, id_token: null, expires: 0 };

  async getBHYTToken() {
    const username = process.env.BHYT_USERNAME;
    const password = process.env.BHYT_PASSWORD;
    const now = Date.now();
    if (this.bhytTokenCache.token && this.bhytTokenCache.id_token && this.bhytTokenCache.expires > now) {
      return this.bhytTokenCache;
    }
    const axios = (await import('axios')).default;
    const tokenRes = await axios.post('https://egw.baohiemxahoi.gov.vn/api/token/take', {
      username : username,
      password : password
    });
      // Đáp ứng dữ liệu mới: lấy từ tokenRes.data.APIKey
      const apiKey = tokenRes.data.APIKey || {};
      // expires_in là dạng ISO, cần chuyển sang timestamp
      let expires = now + 3600 * 1000;
      if (apiKey.expires_in) {
        const expDate = new Date(apiKey.expires_in);
        expires = expDate.getTime();
      }
      this.bhytTokenCache = {
        token: apiKey.access_token || '',
        id_token: apiKey.id_token || '',
        expires
      };
    return this.bhytTokenCache;
  }

  async checkBHYTCard({ maThe, hoTen, ngaySinh }) {
    const username = process.env.BHYT_USERNAME;
    const password = process.env.BHYT_PASSWORD;
    const hoTenCb = process.env.BHYT_HOTENCB;
    const cccdCb = process.env.BHYT_CCCDCB;
    const axios = (await import('axios')).default;
    let { token, id_token } = await this.getBHYTToken();
    const checkUrl = `https://daotaoegw.baohiemxahoi.gov.vn/api/egw/KQNhanLichSuKCB2024?id_token=${id_token}&password=${password}&token=${token}&username=${username}`;
    const body = { maThe, hoTen, ngaySinh, hoTenCb, cccdCb };
    try {
      let response = await axios.post(checkUrl, body);
      if (response.data && response.data.maKetQua === "401") {
        // Nếu token sai, gọi lại lấy token mới và thử lại một lần
        ({ token, id_token } = await this.getBHYTToken());
        const retryUrl = `https://daotaoegw.baohiemxahoi.gov.vn/api/egw/KQNhanLichSuKCB2024?id_token=${id_token}&password=${password}&token=${token}&username=${username}`;
        response = await axios.post(retryUrl, body);
        if (response.data && response.data.maKetQua === "401") {
          return { success: false, message: response.data.ghiChu || "Token không đúng.", code: "401", data: response.data };
        }
      }
      return { success: true, data: response.data };
    } catch (err) {
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
