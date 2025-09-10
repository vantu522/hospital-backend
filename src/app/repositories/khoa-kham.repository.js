import KhoaKham from '../../models/khoa-kham.model.js';

class KhoaKhamRepository {
  // Lấy tất cả khoa khám với pagination
  async getAll(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const data = await KhoaKham.find()
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await KhoaKham.countDocuments();
    
    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  // Lấy khoa khám đang hoạt động
  async getActive() {
    return await KhoaKham.find({ is_active: true })
      .sort({ ten: 1 })
      .lean();
  }

  // Lấy khoa khám theo ID
  async getById(id) {
    return await KhoaKham.findById(id).lean();
  }

  // Tạo khoa khám mới
  async create(khoaKhamData) {
    const khoaKham = new KhoaKham(khoaKhamData);
    return await khoaKham.save();
  }

  // Cập nhật khoa khám
  async update(id, updateData) {
    return await KhoaKham.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
  }

  // Xóa mềm khoa khám
  async softDelete(id) {
    return await KhoaKham.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );
  }

  // Khôi phục khoa khám
  async restore(id) {
    return await KhoaKham.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true }
    );
  }

  // Kiểm tra khoa khám có tồn tại không
  async exists(id) {
    const count = await KhoaKham.countDocuments({ _id: id });
    return count > 0;
  }

  // Kiểm tra mã khoa khám có tồn tại không
  async existsByMa(ma, excludeId = null) {
    const filter = { ma: ma.toUpperCase() };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await KhoaKham.countDocuments(filter);
    return count > 0;
  }

  // Lấy khoa khám theo cấp quản lí
  async getByCapQuanLi(capQuanLi) {
    return await KhoaKham.find({ 
      cap_quan_li: capQuanLi, 
      is_active: true 
    })
    .sort({ ten: 1 })
    .lean();
  }
}

export default new KhoaKhamRepository();
