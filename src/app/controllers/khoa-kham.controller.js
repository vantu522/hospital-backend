import khoaKhamService from '../services/khoa-kham.service.js';

class KhoaKhamController {
  /**
   * @swagger
   * /api/khoa-kham:
   *   get:
   *     tags: [KhoaKham]
   *     summary: Lấy danh sách khoa khám
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
   *                     $ref: '#/components/schemas/KhoaKham'
   */
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      const result = await khoaKhamService.getAll(
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

  // Lấy khoa khám đang hoạt động
  async getActive(req, res) {
    try {
      const data = await khoaKhamService.getActive();
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

  // Lấy khoa khám theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await khoaKhamService.getById(id);
      
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

  // Tạo khoa khám mới
  async create(req, res) {
    try {
      const khoaKhamData = req.body;
      const data = await khoaKhamService.create(khoaKhamData);
      
      return res.status(201).json({
        success: true,
        data,
        message: 'Tạo khoa khám thành công'
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

  // Cập nhật khoa khám
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await khoaKhamService.update(id, updateData);
      
      return res.status(200).json({
        success: true,
        data,
        message: 'Cập nhật khoa khám thành công'
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

  // Xóa mềm khoa khám
  async delete(req, res) {
    try {
      const { id } = req.params;
      const data = await khoaKhamService.delete(id);
      
      return res.status(200).json({
        success: true,
        data,
        message: 'Xóa khoa khám thành công'
      });
    } catch (error) {
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Khôi phục khoa khám
  async restore(req, res) {
    try {
      const { id } = req.params;
      const data = await khoaKhamService.restore(id);
      
      return res.status(200).json({
        success: true,
        data,
        message: 'Khôi phục khoa khám thành công'
      });
    } catch (error) {
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy khoa khám theo cấp quản lí
  async getByCapQuanLi(req, res) {
    try {
      const { capQuanLi } = req.params;
      const data = await khoaKhamService.getByCapQuanLi(capQuanLi);
      
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      const statusCode = error.message.includes('không được để trống') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new KhoaKhamController();
