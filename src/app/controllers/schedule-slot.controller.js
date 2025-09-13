/**
 * @swagger
 * /api/schedule-slots:
 *   post:
 *     summary: Tạo khung giờ khám
 *     tags: [ScheduleSlot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - timeSlot
 *               - IdPhongKham
 *               - capacity
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: string
 *               IdPhongKham:
 *                 type: string
 *                 description: ObjectId của phòng khám
 *               capacity:
 *                 type: number
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
 *                   $ref: '#/components/schemas/ScheduleSlot'
 *       400:
 *         description: Lỗi tạo khung giờ
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
 *     summary: Lấy danh sách khung giờ khám
 *     tags: [ScheduleSlot]
 *     responses:
 *       200:
 *         description: Danh sách khung giờ
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
 *                     $ref: '#/components/schemas/ScheduleSlot'
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
 * /api/schedule-slots/{id}:
 *   delete:
 *     summary: Xóa khung giờ khám
 *     tags: [ScheduleSlot]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId khung giờ
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
 *                   $ref: '#/components/schemas/ScheduleSlot'
 *       404:
 *         description: Không tìm thấy khung giờ
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
