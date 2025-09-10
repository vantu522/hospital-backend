import loaiKhamService from '../services/loai-kham.service.js';

class LoaiKhamController {
  // Tạo loại khám mới
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

  // Lấy tất cả loại khám
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

  // Lấy loại khám theo ID
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

  // Lấy danh sách loại khám active (cho dropdown)
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

  // Cập nhật loại khám
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

  // Xóa loại khám (soft delete)
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

  // Khôi phục loại khám
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
