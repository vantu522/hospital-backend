import congKhamService from '../services/cong-kham.service.js';

class CongKhamController {
  /**
   * @swagger
   * /api/cong-kham:
   *   get:
   *     summary: Lấy danh sách tất cả cổng khám (có phân trang)
   *     tags:
   *       - CongKham
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Số trang
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Số bản ghi mỗi trang
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           default: createdAt
   *         description: Trường sắp xếp
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Thứ tự sắp xếp
   *     responses:
   *       200:
   *         description: Danh sách cổng khám
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
   *                     $ref: '#/components/schemas/CongKham'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       description: Tổng số bản ghi
   *                     page:
   *                       type: integer
   *                       description: Trang hiện tại
   *                     limit:
   *                       type: integer
   *                       description: Số bản ghi mỗi trang
   *                     totalPages:
   *                       type: integer
   *                       description: Tổng số trang
   *       500:
   *         description: Lỗi server
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      const result = await congKhamService.getAll(
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

  /**
   * @swagger
   * /api/cong-kham/active:
   *   get:
   *     summary: Lấy danh sách cổng khám đang hoạt động
   *     tags:
   *       - CongKham
   *     responses:
   *       200:
   *         description: Danh sách cổng khám đang hoạt động
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
   *                     $ref: '#/components/schemas/CongKham'
   *       500:
   *         description: Lỗi server
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getActive(req, res) {
    try {
      const data = await congKhamService.getActive();
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

  /**
   * @swagger
   * /api/cong-kham/{id}:
   *   get:
   *     summary: Lấy thông tin cổng khám theo ID
   *     tags:
   *       - CongKham
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của cổng khám
   *     responses:
   *       200:
   *         description: Thông tin cổng khám
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CongKham'
   *       404:
   *         description: Không tìm thấy cổng khám
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Lỗi server
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await congKhamService.getById(id);
      
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

  /**
   * @swagger
   * /api/cong-kham:
   *   post:
   *     summary: Tạo mới cổng khám
   *     tags:
   *       - CongKham
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ma_bv
   *               - ma_bhyt
   *               - ten_bv
   *               - ten_bhyt
   *             properties:
   *               ma_bv:
   *                 type: string
   *                 description: Mã bệnh viện
   *               ma_bhyt:
   *                 type: string
   *                 description: Mã BHYT
   *               ten_bv:
   *                 type: string
   *                 description: Tên bệnh viện
   *               ten_bhyt:
   *                 type: string
   *                 description: Tên BHYT
   *               is_active:
   *                 type: boolean
   *                 default: true
   *                 description: Trạng thái hoạt động
   *     responses:
   *       201:
   *         description: Tạo cổng khám thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CongKham'
   *                 message:
   *                   type: string
   *                   example: Tạo cổng khám thành công
   *       400:
   *         description: Dữ liệu không hợp lệ hoặc mã đã tồn tại
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Không có quyền truy cập
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Lỗi server
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async create(req, res) {
    try {
      const congKhamData = req.body;
      const data = await congKhamService.create(congKhamData);
      
      return res.status(201).json({
        success: true,
        data,
        message: 'Tạo cổng khám thành công'
      });
    } catch (error) {
      const statusCode = error.message.includes('đã tồn tại') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/cong-kham/{id}:
   *   put:
   *     summary: Cập nhật thông tin cổng khám
   *     tags:
   *       - CongKham
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của cổng khám cần cập nhật
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               ma_bv:
   *                 type: string
   *                 description: Mã bệnh viện
   *               ma_bhyt:
   *                 type: string
   *                 description: Mã BHYT
   *               ten_bv:
   *                 type: string
   *                 description: Tên bệnh viện
   *               ten_bhyt:
   *                 type: string
   *                 description: Tên BHYT
   *               is_active:
   *                 type: boolean
   *                 description: Trạng thái hoạt động
   *     responses:
   *       200:
   *         description: Cập nhật cổng khám thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CongKham'
   *                 message:
   *                   type: string
   *                   example: Cập nhật cổng khám thành công
   *       400:
   *         description: Dữ liệu không hợp lệ hoặc mã đã tồn tại
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Không có quyền truy cập
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Không tìm thấy cổng khám
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Lỗi server
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await congKhamService.update(id, updateData);
      
      return res.status(200).json({
        success: true,
        data,
        message: 'Cập nhật cổng khám thành công'
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

  /**
   * @swagger
   * /api/cong-kham/{id}:
   *   delete:
   *     summary: Xóa mềm cổng khám
   *     tags:
   *       - CongKham
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của cổng khám cần xóa
   *     responses:
   *       200:
   *         description: Xóa cổng khám thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CongKham'
   *                 message:
   *                   type: string
   *                   example: Xóa cổng khám thành công
   *       401:
   *         description: Không có quyền truy cập
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Không tìm thấy cổng khám
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Lỗi server
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const data = await congKhamService.delete(id);
      
      return res.status(200).json({
        success: true,
        data,
        message: 'Xóa cổng khám thành công'
      });
    } catch (error) {
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/cong-kham/{id}/restore:
   *   patch:
   *     summary: Khôi phục cổng khám đã xóa
   *     tags:
   *       - CongKham
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của cổng khám cần khôi phục
   *     responses:
   *       200:
   *         description: Khôi phục cổng khám thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CongKham'
   *                 message:
   *                   type: string
   *                   example: Khôi phục cổng khám thành công
   *       401:
   *         description: Không có quyền truy cập
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Không tìm thấy cổng khám
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Lỗi server
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async restore(req, res) {
    try {
      const { id } = req.params;
      const data = await congKhamService.restore(id);
      
      return res.status(200).json({
        success: true,
        data,
        message: 'Khôi phục cổng khám thành công'
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

export default new CongKhamController();
