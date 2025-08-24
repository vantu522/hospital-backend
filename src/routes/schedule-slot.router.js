import express from 'express';
import scheduleSlotController from '../app/controllers/schedule-slot.controller.js';
import { validateScheduleSlot } from '../app/middlewares/schedule-slot.validator.js';

const router = express.Router();

// Tạo khung giờ khám
router.post('/', validateScheduleSlot, scheduleSlotController.createSlot);
// Lấy danh sách khung giờ khám
router.get('/', scheduleSlotController.getSlots);
// Xóa khung giờ khám
router.delete('/:id', scheduleSlotController.deleteSlot);

export default router;
