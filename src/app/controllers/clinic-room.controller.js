/**
 * @swagger
 * /api/clinic-rooms:
 *   post:
 *     summary: Tạo phòng khám mới
 *     tags: [ClinicRoom]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rooms
 *             properties:
 *               name:
 *                 type: string
 *               rooms:
 *                 type: array
 *                 items:
 *                   type: string
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
 *                   $ref: '#/components/schemas/ClinicRoom'
 *       400:
 *         description: Lỗi tạo phòng khám
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
 *     summary: Lấy danh sách phòng khám
 *     tags: [ClinicRoom]
 *     responses:
 *       200:
 *         description: Danh sách phòng khám
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
 *                     $ref: '#/components/schemas/ClinicRoom'
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
 * /api/clinic-rooms/{id}:
 *   get:
 *     summary: Lấy thông tin phòng khám theo id
 *     tags: [ClinicRoom]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId phòng khám
 *     responses:
 *       200:
 *         description: Thông tin phòng khám
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClinicRoom'
 *       404:
 *         description: Không tìm thấy phòng khám
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
 *   put:
 *     summary: Cập nhật phòng khám
 *     tags: [ClinicRoom]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId phòng khám
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rooms:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClinicRoom'
 *       404:
 *         description: Không tìm thấy phòng khám
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
 *         description: Lỗi cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *   delete:
 *     summary: Xóa phòng khám
 *     tags: [ClinicRoom]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId phòng khám
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
 *                 data:
 *                   $ref: '#/components/schemas/ClinicRoom'
 *       404:
 *         description: Không tìm thấy phòng khám
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
import ClinicRoomService from '../services/clinic-room.service.js';

const ClinicRoomController = {
  async create(req, res) {
    try {
  const room = await ClinicRoomService.create(req.body);
      res.status(201).json({ success: true, data: room });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  async getAll(req, res) {
    try {
  const rooms = await ClinicRoomService.getAll();
      res.status(200).json({ success: true, data: rooms });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  async getById(req, res) {
    try {
  const room = await ClinicRoomService.getById(req.params.id);
      if (!room) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data: room });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  async update(req, res) {
    try {
  const room = await ClinicRoomService.update(req.params.id, req.body);
      if (!room) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data: room });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  async delete(req, res) {
    try {
  const room = await ClinicRoomService.delete(req.params.id);
      if (!room) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data: room });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

export default ClinicRoomController;
