import PhongKham from '../../models/phong-kham.model.js';

class PhongKhamRepository {
  // Lấy tất cả phòng khám với pagination
  async getAll(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const data = await PhongKham.find()
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await PhongKham.countDocuments();
    
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

  // Lấy phòng khám đang hoạt động
  async getActive() {
    return await PhongKham.find({ is_active: true })
      .sort({ ten: 1 })
      .lean();
  }

  // Lấy phòng khám theo ID
  async getById(id) {
    return await PhongKham.findById(id).lean();
  }

  // Tạo phòng khám mới
  async create(phongKhamData) {
    const phongKham = new PhongKham(phongKhamData);
    return await phongKham.save();
  }

  // Cập nhật phòng khám
  async update(id, updateData) {
    return await PhongKham.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
  }

  // Xóa mềm phòng khám
  async softDelete(id) {
    return await PhongKham.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );
  }

  // Khôi phục phòng khám
  async restore(id) {
    return await PhongKham.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true }
    );
  }

  // Kiểm tra phòng khám có tồn tại không
  async exists(id) {
    const count = await PhongKham.countDocuments({ _id: id });
    return count > 0;
  }

  // Kiểm tra mã phòng khám có tồn tại không
  async existsByMa(ma, excludeId = null) {
    const filter = { ma: ma.toUpperCase() };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await PhongKham.countDocuments(filter);
    return count > 0;
  }
}

export default new PhongKhamRepository();
