import phongKhamRepository from '../repositories/phong-kham.repository.js';

class PhongKhamService {
  // Lấy tất cả phòng khám
  async getAll(page, limit, sortBy, sortOrder) {
    try {
      return await phongKhamRepository.getAll(page, limit, sortBy, sortOrder);
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách phòng khám: ${error.message}`);
    }
  }

  // Lấy phòng khám đang hoạt động
  async getActive() {
    try {
      return await phongKhamRepository.getActive();
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách phòng khám hoạt động: ${error.message}`);
    }
  }

  // Lấy phòng khám theo ID
  async getById(id) {
    try {
      const phongKham = await phongKhamRepository.getById(id);
      if (!phongKham) {
        throw new Error('Không tìm thấy phòng khám');
      }
      return phongKham;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin phòng khám: ${error.message}`);
    }
  }

  // Tạo phòng khám mới
  async create(phongKhamData) {
    try {
      // Validate dữ liệu đầu vào
      const { _id, ma, ten, dia_chi } = phongKhamData;
      
      if (!_id || !ma || !ten || !dia_chi) {
        throw new Error('Thiếu thông tin bắt buộc');
      }

      // Kiểm tra ID đã tồn tại chưa
      const existsById = await phongKhamRepository.exists(_id);
      if (existsById) {
        throw new Error('ID phòng khám đã tồn tại');
      }

      // Kiểm tra mã đã tồn tại chưa
      const existsByMa = await phongKhamRepository.existsByMa(ma);
      if (existsByMa) {
        throw new Error('Mã phòng khám đã tồn tại');
      }

      // Tạo phòng khám mới
      const newPhongKham = await phongKhamRepository.create(phongKhamData);
      return newPhongKham;
    } catch (error) {
      throw new Error(`Lỗi khi tạo phòng khám: ${error.message}`);
    }
  }

  // Cập nhật phòng khám
  async update(id, updateData) {
    try {
      // Kiểm tra phòng khám có tồn tại không
      const exists = await phongKhamRepository.exists(id);
      if (!exists) {
        throw new Error('Không tìm thấy phòng khám');
      }

      // Nếu có cập nhật mã, kiểm tra mã mới có trùng không
      if (updateData.ma) {
        const existsByMa = await phongKhamRepository.existsByMa(updateData.ma, id);
        if (existsByMa) {
          throw new Error('Mã phòng khám đã tồn tại');
        }
      }

      const updatedPhongKham = await phongKhamRepository.update(id, updateData);
      return updatedPhongKham;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật phòng khám: ${error.message}`);
    }
  }

  // Xóa mềm phòng khám
  async delete(id) {
    try {
      const exists = await phongKhamRepository.exists(id);
      if (!exists) {
        throw new Error('Không tìm thấy phòng khám');
      }

      const deletedPhongKham = await phongKhamRepository.softDelete(id);
      return deletedPhongKham;
    } catch (error) {
      throw new Error(`Lỗi khi xóa phòng khám: ${error.message}`);
    }
  }

  // Khôi phục phòng khám
  async restore(id) {
    try {
      const exists = await phongKhamRepository.exists(id);
      if (!exists) {
        throw new Error('Không tìm thấy phòng khám');
      }

      const restoredPhongKham = await phongKhamRepository.restore(id);
      return restoredPhongKham;
    } catch (error) {
      throw new Error(`Lỗi khi khôi phục phòng khám: ${error.message}`);
    }
  }
}

export default new PhongKhamService();
