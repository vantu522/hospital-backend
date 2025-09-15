import congKhamRepository from '../repositories/cong-kham.repository.js';

class CongKhamService {
  // Lấy tất cả cổng khám
  async getAll(page, limit, sortBy, sortOrder) {
    try {
      return await congKhamRepository.getAll(page, limit, sortBy, sortOrder);
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách cổng khám: ${error.message}`);
    }
  }

  // Lấy tất cả cổng khám đang hoạt động (không cần tham số)
  async getActive() {
    try {
      // Gọi repository không truyền tham số, lấy tất cả cổng khám đang hoạt động
      const activeGateways = await congKhamRepository.getActive();
      return activeGateways;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách cổng khám hoạt động: ${error.message}`);
    }
  }

  // Lấy cổng khám theo ID
  async getById(id) {
    try {
      const congKham = await congKhamRepository.getById(id);
      if (!congKham) {
        throw new Error('Không tìm thấy cổng khám');
      }
      return congKham;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin cổng khám: ${error.message}`);
    }
  }

  // Tạo cổng khám mới
  async create(congKhamData) {
    try {
      // Kiểm tra ID đã tồn tại chưa
      const existsById = await congKhamRepository.exists(congKhamData._id);
      if (existsById) {
        throw new Error('ID cổng khám đã tồn tại');
      }

      // Kiểm tra mã bệnh viện đã tồn tại chưa
      const existsByMaBv = await congKhamRepository.existsByMaBv(congKhamData.ma_bv);
      if (existsByMaBv) {
        throw new Error('Mã bệnh viện đã tồn tại');
      }

      // Kiểm tra mã BHYT đã tồn tại chưa
      const existsByMaBhyt = await congKhamRepository.existsByMaBhyt(congKhamData.ma_bhyt);
      if (existsByMaBhyt) {
        throw new Error('Mã BHYT đã tồn tại');
      }

      // Tạo cổng khám mới
      const newCongKham = await congKhamRepository.create(congKhamData);
      return newCongKham;
    } catch (error) {
      throw new Error(`Lỗi khi tạo cổng khám: ${error.message}`);
    }
  }

  // Cập nhật cổng khám
  async update(id, updateData) {
    try {
      // Kiểm tra cổng khám có tồn tại không
      const exists = await congKhamRepository.exists(id);
      if (!exists) {
        throw new Error('Không tìm thấy cổng khám');
      }

      // Nếu có cập nhật mã bệnh viện, kiểm tra mã mới có trùng không
      if (updateData.ma_bv) {
        const existsByMaBv = await congKhamRepository.existsByMaBv(updateData.ma_bv, id);
        if (existsByMaBv) {
          throw new Error('Mã bệnh viện đã tồn tại');
        }
      }

      // Nếu có cập nhật mã BHYT, kiểm tra mã mới có trùng không
      if (updateData.ma_bhyt) {
        const existsByMaBhyt = await congKhamRepository.existsByMaBhyt(updateData.ma_bhyt, id);
        if (existsByMaBhyt) {
          throw new Error('Mã BHYT đã tồn tại');
        }
      }

      const updatedCongKham = await congKhamRepository.update(id, updateData);
      return updatedCongKham;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật cổng khám: ${error.message}`);
    }
  }

  // Xóa mềm cổng khám
  async delete(id) {
    try {
      const exists = await congKhamRepository.exists(id);
      if (!exists) {
        throw new Error('Không tìm thấy cổng khám');
      }

      const deletedCongKham = await congKhamRepository.softDelete(id);
      return deletedCongKham;
    } catch (error) {
      throw new Error(`Lỗi khi xóa cổng khám: ${error.message}`);
    }
  }

  // Khôi phục cổng khám
  async restore(id) {
    try {
      const exists = await congKhamRepository.exists(id);
      if (!exists) {
        throw new Error('Không tìm thấy cổng khám');
      }

      const restoredCongKham = await congKhamRepository.restore(id);
      return restoredCongKham;
    } catch (error) {
      throw new Error(`Lỗi khi khôi phục cổng khám: ${error.message}`);
    }
  }
}

export default new CongKhamService();
