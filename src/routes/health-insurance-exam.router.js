import express from 'express';
import healthInsuranceExamController from '../app/controllers/health-insurance-exam.controller.js';
import validateInsuranceExam from '../app/middlewares/health-insurance-exam.validator.js';
import { attachRole, requireRole } from '../app/middlewares/auth.js';

const router = express.Router();

// Lấy tất cả lịch khám (có phân trang)
router.get('/all', healthInsuranceExamController.getAllExams);

// Đặt lịch khám bảo hiểm y tế
router.post('/book', validateInsuranceExam, attachRole, healthInsuranceExamController.createExam);

// Check hiệu lực lịch khám bằng mã QR (encoded_id qua path)
router.get('/check/:encoded_id', healthInsuranceExamController.checkExamByEncodedId);

// Lấy lịch khám theo CCCD
router.get('/by-cccd/:cccd', healthInsuranceExamController.getExamByCCCD);
// Kiểm tra ngày hiệu lực/ngày hết hạn thẻ BHYT
router.post('/check-bhyt-date', healthInsuranceExamController.checkBHYTCard);

// Lấy lịch khám theo id
router.get('/:id', healthInsuranceExamController.getExamById);

// Cập nhật lịch khám theo id (cần quyền admin, superadmin hoặc receptionist)
router.put('/:id', requireRole(['admin', 'superadmin', 'receptionist']), healthInsuranceExamController.updateExam);

// Xóa lịch khám theo id (cần quyền admin, superadmin hoặc receptionist)
router.delete('/:id', requireRole(['admin', 'superadmin', 'receptionist']), healthInsuranceExamController.deleteExam);

export default router;
