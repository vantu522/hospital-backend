import TimeSlotTemplateService from '../services/time-slot-template.service.js';

// Tạo khung giờ mẫu
const createTemplate = async (req, res) => {
  try {
    const result = await TimeSlotTemplateService.createTemplate(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy danh sách khung giờ mẫu
const getTemplates = async (req, res) => {
  try {
    const result = await TimeSlotTemplateService.getTemplates();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa khung giờ mẫu
const deleteTemplate = async (req, res) => {
  try {
    const result = await TimeSlotTemplateService.deleteTemplate(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy khung giờ mẫu' });
    return res.status(200).json({ success: true, message: 'Đã xóa khung giờ mẫu', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default {
  createTemplate,
  getTemplates,
  deleteTemplate
};
