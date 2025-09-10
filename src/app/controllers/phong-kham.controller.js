import phongKhamService from '../services/phong-kham.service.js';

class PhongKhamController {
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
