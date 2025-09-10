import congKhamService from '../services/cong-kham.service.js';

class CongKhamController {
  // Lấy tất cả cổng khám
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

  // Lấy cổng khám đang hoạt động
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

  // Lấy cổng khám theo ID
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

  // Tạo cổng khám mới
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

  // Cập nhật cổng khám
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

  // Xóa mềm cổng khám
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

  // Khôi phục cổng khám
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
