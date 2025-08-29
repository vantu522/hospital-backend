import express from 'express';
import healthInsuranceExamController from '../app/controllers/health-insurance-exam.controller.js';
import validateInsuranceExam from '../app/middlewares/health-insurance-exam.validator.js';
import { attachRole } from '../app/middlewares/auth.js';

const router = express.Router();

// Đặt lịch khám bảo hiểm y tế
router.post('/book', validateInsuranceExam,attachRole, healthInsuranceExamController.createExam);


// Check hiệu lực lịch khám bằng mã QR (encoded_id qua path)
router.get('/check/:encoded_id', healthInsuranceExamController.checkExamByEncodedId);

// Kiểm tra ngày hiệu lực/ngày hết hạn thẻ BHYT
router.post('/check-bhyt-date', healthInsuranceExamController.checkBHYTCard);
// Lấy lịch khám theo id
router.get('/:id', healthInsuranceExamController.getExamById);

export default router;
