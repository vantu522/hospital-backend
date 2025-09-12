import LoaiKham from '../../models/loai-kham.model.js';

class LoaiKhamRepository {
  // Tạo mới loại khám
  async create(data) {
    return await LoaiKham.create(data);
  }

  // Lấy tất cả loại khám với phân trang
  async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const query = { ...filters };

    const [data, total] = await Promise.all([
      LoaiKham.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      LoaiKham.countDocuments(query)
    ]);

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

  // Tìm theo ID
  async findById(id) {
    return await LoaiKham.findById(id).lean();
  }

  // Tìm theo mã
  async findByMa(ma) {
    return await LoaiKham.findOne({ ma: ma.toUpperCase() }).lean();
  }

  // Tìm những loại khám active
  async findActive() {
    return await LoaiKham.find({ is_active: true }).sort({ ten: 1 }).lean();
  }

  // Cập nhật theo ID
  async updateById(id, data) {
    return await LoaiKham.findByIdAndUpdate(id, data, { 
      new: true, 
      runValidators: true 
    }).lean();
  }

  // Xóa theo ID (soft delete - chỉ set is_active = false)
  async deleteById(id) {
    return await LoaiKham.findByIdAndUpdate(id, { is_active: false }, { new: true }).lean();
  }

  // Xóa vĩnh viễn
  async hardDeleteById(id) {
    return await LoaiKham.findByIdAndDelete(id);
  }

  // Tìm kiếm theo tên
  async search(keyword, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {
      $or: [
        { ten: { $regex: keyword, $options: 'i' } },
        { ma: { $regex: keyword.toUpperCase(), $options: 'i' } }
      ]
    };

    const [data, total] = await Promise.all([
      LoaiKham.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      LoaiKham.countDocuments(query)
    ]);

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

  // Check tồn tại theo mã
  async existsByMa(ma, excludeId = null) {
    const query = { ma: ma.toUpperCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await LoaiKham.countDocuments(query);
    return count > 0;
  }
}

export default new LoaiKhamRepository();
