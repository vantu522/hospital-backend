import loaiKhamRepository from '../repositories/loai-kham.repository.js';

class LoaiKhamService {
  // Tạo loại khám mới
  async createLoaiKham(data) {
    const { _id, ma, ten } = data;

    // Kiểm tra ID đã tồn tại chưa
    const existingById = await loaiKhamRepository.findById(_id);
    if (existingById) {
      throw new Error('ID loại khám đã tồn tại');
    }

    // Kiểm tra mã đã tồn tại chưa
    const existingByMa = await loaiKhamRepository.findByMa(ma);
    if (existingByMa) {
      throw new Error('Mã loại khám đã tồn tại');
    }

    // Tạo mới
    const loaiKham = await loaiKhamRepository.create({
      _id: _id.trim(),
      ma: ma.trim().toUpperCase(),
      ten: ten.trim(),
      is_active: true
    });

    return loaiKham;
  }

  // Lấy danh sách loại khám
  async getAllLoaiKham(page = 1, limit = 10, filters = {}) {
    // Xử lý filters
    const processedFilters = {};
    
    if (filters.is_active !== undefined) {
      processedFilters.is_active = filters.is_active === 'true';
    }

    if (filters.ma) {
      processedFilters.ma = { $regex: filters.ma, $options: 'i' };
    }

    if (filters.ten) {
      processedFilters.ten = { $regex: filters.ten, $options: 'i' };
    }

    return await loaiKhamRepository.findAll(page, limit, processedFilters);
  }

  // Lấy loại khám theo ID
  async getLoaiKhamById(id) {
    const loaiKham = await loaiKhamRepository.findById(id);
    if (!loaiKham) {
      throw new Error('Không tìm thấy loại khám');
    }
    return loaiKham;
  }

  // Lấy danh sách loại khám active (cho dropdown)
  async getActiveLoaiKham() {
    return await loaiKhamRepository.findActive();
  }

  // Cập nhật loại khám
  async updateLoaiKham(id, data) {
    const existingLoaiKham = await loaiKhamRepository.findById(id);
    if (!existingLoaiKham) {
      throw new Error('Không tìm thấy loại khám');
    }

    // Nếu cập nhật mã, kiểm tra trùng lặp
    if (data.ma && data.ma.toUpperCase() !== existingLoaiKham.ma) {
      const existingByMa = await loaiKhamRepository.existsByMa(data.ma, id);
      if (existingByMa) {
        throw new Error('Mã loại khám đã tồn tại');
      }
    }

    // Xử lý data update
    const updateData = {};
    if (data.ma) updateData.ma = data.ma.trim().toUpperCase();
    if (data.ten) updateData.ten = data.ten.trim();
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const updatedLoaiKham = await loaiKhamRepository.updateById(id, updateData);
    if (!updatedLoaiKham) {
      throw new Error('Cập nhật thất bại');
    }

    return updatedLoaiKham;
  }

  // Xóa loại khám (soft delete)
  async deleteLoaiKham(id) {
    const existingLoaiKham = await loaiKhamRepository.findById(id);
    if (!existingLoaiKham) {
      throw new Error('Không tìm thấy loại khám');
    }

    if (!existingLoaiKham.is_active) {
      throw new Error('Loại khám đã bị xóa trước đó');
    }

    const deletedLoaiKham = await loaiKhamRepository.deleteById(id);
    return deletedLoaiKham;
  }

  // Khôi phục loại khám
  async restoreLoaiKham(id) {
    const existingLoaiKham = await loaiKhamRepository.findById(id);
    if (!existingLoaiKham) {
      throw new Error('Không tìm thấy loại khám');
    }

    if (existingLoaiKham.is_active) {
      throw new Error('Loại khám đang hoạt động');
    }

    const restoredLoaiKham = await loaiKhamRepository.updateById(id, { is_active: true });
    return restoredLoaiKham;
  }
}

export default new LoaiKhamService();
