import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';

import QRCode from 'qrcode';

class HealthInsuranceExamService {
  async createExam(data) {
    const exam = await healthInsuranceExamRepository.create(data);
    // Tạo mã QR code base64 chứa id
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
    // Nếu hợp lệ, đổi status thành accept
    if (exam.status !== 'accept') {
      exam.status = 'accept';
      await exam.save();
    }
    return { valid: true, message: 'Lịch khám hợp lệ, check-in thành công', exam };
  }
}

export default new HealthInsuranceExamService();
