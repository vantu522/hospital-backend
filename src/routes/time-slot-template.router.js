import express from 'express';
import timeSlotTemplateController from '../app/controllers/time-slot-template.controller.js';
import { validateTimeSlotTemplate } from '../app/middlewares/time-slot-template.validator.js';

const router = express.Router();

// Tạo khung giờ mẫu
router.post('/', validateTimeSlotTemplate, timeSlotTemplateController.createTemplate);
// Lấy danh sách khung giờ mẫu
router.get('/', timeSlotTemplateController.getTemplates);
// Xóa khung giờ mẫu
router.delete('/:id', timeSlotTemplateController.deleteTemplate);
export default router;
