import ScheduleSlotService from '../services/schedule-slot.service.js';

// Tạo khung giờ khám
const createSlot = async (req, res) => {
  try {
    const slot = await ScheduleSlotService.createSlot(req.body);
    return res.status(201).json({ success: true, data: slot });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy danh sách khung giờ khám
const getSlots = async (req, res) => {
  try {
    const slots = await ScheduleSlotService.getSlots();
    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa khung giờ khám
const deleteSlot = async (req, res) => {
  try {
    const slot = await ScheduleSlotService.deleteSlot(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Không tìm thấy khung giờ' });
    return res.status(200).json({ success: true, message: 'Đã xóa khung giờ', data: slot });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default {
  createSlot,
  getSlots,
  deleteSlot
};
