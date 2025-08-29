/**
 * @swagger
 * /api/time-slot-templates:
 *   post:
 *     summary: Tạo khung giờ mẫu
 *     tags: [TimeSlotTemplate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - time
 *               - capacity
 *             properties:
 *               time:
 *                 type: string
 *                 description: "Khung giờ, định dạng hh:mm (ví dụ: 07:30)"
 *               capacity:
 *                 type: number
 *                 description: Số lượng tối đa
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TimeSlotTemplate'
 *       400:
 *         description: Lỗi tạo khung giờ mẫu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *   get:
 *     summary: Lấy danh sách khung giờ mẫu
 *     tags: [TimeSlotTemplate]
 *     responses:
 *       200:
 *         description: Danh sách khung giờ mẫu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimeSlotTemplate'
 *       400:
 *         description: Lỗi truy vấn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 * /api/time-slot-templates/{id}:
 *   delete:
 *     summary: Xóa khung giờ mẫu
 *     tags: [TimeSlotTemplate]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId khung giờ mẫu
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TimeSlotTemplate'
 *       404:
 *         description: Không tìm thấy khung giờ mẫu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Lỗi xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
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
