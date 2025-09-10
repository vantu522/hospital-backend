import khoaKhamRepository from '../repositories/khoa-kham.repository.js';

class KhoaKhamService {
  // Lấy tất cả khoa khám
  async getAll(page, limit, sortBy, sortOrder) {
    try {
      return await khoaKhamRepository.getAll(page, limit, sortBy, sortOrder);
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách khoa khám: ${error.message}`);
    }
  }

  // Lấy khoa khám đang hoạt động
  async getActive() {
    try {
      return await khoaKhamRepository.getActive();
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách khoa khám hoạt động: ${error.message}`);
    }
  }

  // Lấy khoa khám theo ID
  async getById(id) {
    try {
      const khoaKham = await khoaKhamRepository.getById(id);
      if (!khoaKham) {
        throw new Error('Không tìm thấy khoa khám');
      }
      return khoaKham;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin khoa khám: ${error.message}`);
    }
  }

  // Tạo khoa khám mới
  async create(khoaKhamData) {
    try {
      // Validate dữ liệu đầu vào
      const { _id, ma, ten, dia_chi, cap_quan_li } = khoaKhamData;
      
      if (!_id || !ma || !ten || !dia_chi || !cap_quan_li) {
        throw new Error('Thiếu thông tin bắt buộc');
      }

      // Kiểm tra ID đã tồn tại chưa
      const existsById = await khoaKhamRepository.exists(_id);
      if (existsById) {
        throw new Error('ID khoa khám đã tồn tại');
      }

      // Kiểm tra mã đã tồn tại chưa
      const existsByMa = await khoaKhamRepository.existsByMa(ma);
      if (existsByMa) {
        throw new Error('Mã khoa khám đã tồn tại');
      }

      // Tạo khoa khám mới
      const newKhoaKham = await khoaKhamRepository.create(khoaKhamData);
      return newKhoaKham;
    } catch (error) {
      throw new Error(`Lỗi khi tạo khoa khám: ${error.message}`);
    }
  }

  // Cập nhật khoa khám
  async update(id, updateData) {
    try {
      // Kiểm tra khoa khám có tồn tại không
      const exists = await khoaKhamRepository.exists(id);
      if (!exists) {
        throw new Error('Không tìm thấy khoa khám');
      }

      // Nếu có cập nhật mã, kiểm tra mã mới có trùng không
      if (updateData.ma) {
        const existsByMa = await khoaKhamRepository.existsByMa(updateData.ma, id);
        if (existsByMa) {
          throw new Error('Mã khoa khám đã tồn tại');
        }
      }

      const updatedKhoaKham = await khoaKhamRepository.update(id, updateData);
      return updatedKhoaKham;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật khoa khám: ${error.message}`);
    }
  }

  // Xóa mềm khoa khám
  async delete(id) {
    try {
      const exists = await khoaKhamRepository.exists(id);
      if (!exists) {
        throw new Error('Không tìm thấy khoa khám');
      }

      const deletedKhoaKham = await khoaKhamRepository.softDelete(id);
      return deletedKhoaKham;
    } catch (error) {
      throw new Error(`Lỗi khi xóa khoa khám: ${error.message}`);
    }
  }

  // Khôi phục khoa khám
  async restore(id) {
    try {
      const exists = await khoaKhamRepository.exists(id);
      if (!exists) {
        throw new Error('Không tìm thấy khoa khám');
      }

      const restoredKhoaKham = await khoaKhamRepository.restore(id);
      return restoredKhoaKham;
    } catch (error) {
      throw new Error(`Lỗi khi khôi phục khoa khám: ${error.message}`);
    }
  }

  // Lấy khoa khám theo cấp quản lí
  async getByCapQuanLi(capQuanLi) {
    try {
      if (!capQuanLi || capQuanLi.trim() === '') {
        throw new Error('Cấp quản lí không được để trống');
      }
      return await khoaKhamRepository.getByCapQuanLi(capQuanLi.trim());
    } catch (error) {
      throw new Error(`Lỗi khi lấy khoa khám theo cấp quản lí: ${error.message}`);
    }
  }
}

export default new KhoaKhamService();
