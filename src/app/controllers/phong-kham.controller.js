import phongKhamService from '../services/phong-kham.service.js';

class PhongKhamController {
  /**
   * @swagger
   * /api/phong-kham:
   *   get:
   *     tags: [PhongKham]
   *     summary: Lấy danh sách phòng khám
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
   *                     $ref: '#/components/schemas/PhongKham'
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
  /**
   * @swagger
   * /api/phong-kham/active:
   *   get:
   *     tags: [PhongKham]
   *     summary: Lấy danh sách phòng khám đang hoạt động
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
   *                     $ref: '#/components/schemas/PhongKham'
   */
  /**
   * @swagger
   * /api/phong-kham/{id}:
   *   get:
   *     tags: [PhongKham]
   *     summary: Lấy thông tin phòng khám theo ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID phòng khám
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
   *                   $ref: '#/components/schemas/PhongKham'
   */
  /**
   * @swagger
   * /api/phong-kham:
   *   post:
   *     tags: [PhongKham]
   *     summary: Tạo phòng khám mới
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PhongKham'
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
   *                   $ref: '#/components/schemas/PhongKham'
   *                 message:
   *                   type: string
   *                   example: Tạo phòng khám thành công
   */
  /**
   * @swagger
   * /api/phong-kham/{id}:
   *   put:
   *     tags: [PhongKham]
   *     summary: Cập nhật phòng khám
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID phòng khám
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PhongKham'
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
   *                   $ref: '#/components/schemas/PhongKham'
   *                 message:
   *                   type: string
   *                   example: Cập nhật phòng khám thành công
   */
  /**
   * @swagger
   * /api/phong-kham/{id}:
   *   delete:
   *     tags: [PhongKham]
   *     summary: Xóa mềm phòng khám
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID phòng khám
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
   *                   $ref: '#/components/schemas/PhongKham'
   *                 message:
   *                   type: string
   *                   example: Xóa phòng khám thành công
   */
  /**
   * @swagger
   * /api/phong-kham/{id}/restore:
   *   patch:
   *     tags: [PhongKham]
   *     summary: Khôi phục phòng khám
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID phòng khám
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
   *                   $ref: '#/components/schemas/PhongKham'
   *                 message:
   *                   type: string
   *                   example: Khôi phục phòng khám thành công
   */
  // Lấy tất cả phòng khám
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      const result = await phongKhamService.getAll(
        parseInt(page), 
        parseInt(limit), 
        sortBy, 
        sortOrder
      );
      
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy phòng khám đang hoạt động
  async getActive(req, res) {
    try {
      const data = await phongKhamService.getActive();
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy phòng khám theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await phongKhamService.getById(id);
      
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Tạo phòng khám mới
  async create(req, res) {
    try {
      const phongKhamData = req.body;
      const data = await phongKhamService.create(phongKhamData);
      
      return res.status(201).json({
        success: true,
        data,
        message: 'Tạo phòng khám thành công'
      });
    } catch (error) {
      const statusCode = error.message.includes('đã tồn tại') || 
                        error.message.includes('Thiếu thông tin') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật phòng khám
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await phongKhamService.update(id, updateData);
      
      return res.status(200).json({
        success: true,
        data,
        message: 'Cập nhật phòng khám thành công'
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('Không tìm thấy')) {
        statusCode = 404;
      } else if (error.message.includes('đã tồn tại')) {
        statusCode = 400;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Xóa mềm phòng khám
  async delete(req, res) {
    try {
      const { id } = req.params;
      const data = await phongKhamService.delete(id);
      
      return res.status(200).json({
        success: true,
        data,
        message: 'Xóa phòng khám thành công'
      });
    } catch (error) {
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Khôi phục phòng khám
  async restore(req, res) {
    try {
      const { id } = req.params;
      const data = await phongKhamService.restore(id);
      
      return res.status(200).json({
        success: true,
        data,
        message: 'Khôi phục phòng khám thành công'
      });
    } catch (error) {
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new PhongKhamController();
