import loaiKhamService from '../services/loai-kham.service.js';

class LoaiKhamController {
  /**
   * @swagger
   * /api/loai-kham:
   *   post:
   *     tags: [LoaiKham]
   *     summary: Tạo loại khám mới
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoaiKham'
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
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/LoaiKham'
   */
  async create(req, res) {
    try {
      const loaiKham = await loaiKhamService.createLoaiKham(req.body);
      
      res.status(201).json({
        success: true,
        data: loaiKham
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/loai-kham:
   *   get:
   *     tags: [LoaiKham]
   *     summary: Lấy danh sách loại khám
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: page
   *         in: query
   *         description: Số trang
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - name: limit
   *         in: query
   *         description: Số lượng mỗi trang
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *     responses:
   *       200:
   *         description: Thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/LoaiKham'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     currentPage:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     totalItems:
   *                       type: integer
   *                     itemsPerPage:
   *                       type: integer
   */
  async getAll(req, res) {
    try {
      const result = await loaiKhamService.getAllLoaiKham(req.query.page, req.query.limit, req.query);
      res.json(result);
    } catch (error) {
      console.error('Get loai kham error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/loai-kham/{id}:
   *   get:
   *     tags: [LoaiKham]
   *     summary: Lấy thông tin loại khám theo ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID loại khám
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/LoaiKham'
   */
  async getById(req, res) {
    try {
      const loaiKham = await loaiKhamService.getLoaiKhamById(req.params.id);
      
      res.json({
        success: true,
        data: loaiKham
      });
    } catch (error) {
      console.error('Get loai kham by id error:', error);
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/loai-kham/active:
   *   get:
   *     tags: [LoaiKham]
   *     summary: Lấy danh sách loại khám đang hoạt động
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/LoaiKham'
   */
  async getActive(req, res) {
    try {
      const loaiKhamList = await loaiKhamService.getActiveLoaiKham();
      
      res.json({
        success: true,
        data: loaiKhamList
      });
    } catch (error) {
      console.error('Get active loai kham error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/loai-kham/{id}:
   *   put:
   *     tags: [LoaiKham]
   *     summary: Cập nhật loại khám
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID loại khám
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoaiKham'
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
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/LoaiKham'
   */
  async update(req, res) {
    try {
      const loaiKham = await loaiKhamService.updateLoaiKham(req.params.id, req.body);
      
      res.json({
        success: true,
        data: loaiKham
      });
    } catch (error) {
      console.error('Update loai kham error:', error);
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/loai-kham/{id}:
   *   delete:
   *     tags: [LoaiKham]
   *     summary: Xóa mềm loại khám
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID loại khám
   *         schema:
   *           type: string
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
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/LoaiKham'
   */
  async delete(req, res) {
    try {
      const loaiKham = await loaiKhamService.deleteLoaiKham(req.params.id);
      
      res.json({
        success: true,
        data: loaiKham
      });
    } catch (error) {
      console.error('Delete loai kham error:', error);
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/loai-kham/{id}/restore:
   *   patch:
   *     tags: [LoaiKham]
   *     summary: Khôi phục loại khám
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID loại khám
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Khôi phục thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/LoaiKham'
   */
  async restore(req, res) {
    try {
      const loaiKham = await loaiKhamService.restoreLoaiKham(req.params.id);
      
      res.json({
        success: true,
        data: loaiKham
      });
    } catch (error) {
      console.error('Restore loai kham error:', error);
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new LoaiKhamController();
