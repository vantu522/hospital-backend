import CongKham from '../../models/cong-kham.model.js';

class CongKhamRepository {
  // Lấy tất cả cổng khám với pagination
  async getAll(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const data = await CongKham.find()
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await CongKham.countDocuments();
    
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

  // Lấy cổng khám đang hoạt động
  async getActive() {
    return await CongKham.find({ is_active: true })
      .sort({ ten_bv: 1 })
      .lean();
  }

  // Lấy cổng khám theo ID
  async getById(id) {
    return await CongKham.findById(id).lean();
  }

  // Tạo cổng khám mới
  async create(congKhamData) {
    const congKham = new CongKham(congKhamData);
    return await congKham.save();
  }

  // Cập nhật cổng khám
  async update(id, updateData) {
    return await CongKham.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
  }

  // Xóa mềm cổng khám
  async softDelete(id) {
    return await CongKham.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );
  }

  // Khôi phục cổng khám
  async restore(id) {
    return await CongKham.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true }
    );
  }

  // Kiểm tra cổng khám có tồn tại không
  async exists(id) {
    const count = await CongKham.countDocuments({ _id: id });
    return count > 0;
  }

  // Kiểm tra mã bệnh viện có tồn tại không
  async existsByMaBv(ma_bv, excludeId = null) {
    const filter = { ma_bv };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await CongKham.countDocuments(filter);
    return count > 0;
  }

  // Kiểm tra mã BHYT có tồn tại không
  async existsByMaBhyt(ma_bhyt, excludeId = null) {
    const filter = { ma_bhyt };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await CongKham.countDocuments(filter);
    return count > 0;
  }
}

export default new CongKhamRepository();
