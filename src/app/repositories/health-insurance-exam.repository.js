import HealthInsuranceExam from '../../models/health-insurance-exam.model.js';

const create = async (data) => HealthInsuranceExam.create(data);

const findById = async (id) => HealthInsuranceExam.findById(id); // Không dùng lean() để có thể .toObject()

// Tìm max order number chỉ trong các exam đã được accept

// Tìm max order number theo ngày (không phân biệt phòng)
const findMaxOrderNumber = async (exam_date) => {
  // Format ngày để đảm bảo đúng định dạng
  const startOfDay = new Date(exam_date);
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(exam_date);
  endOfDay.setHours(23,59,59,999);
  
  console.log(`🔢 [ORDER] Tìm số thứ tự cao nhất trong ngày: ${startOfDay.toLocaleDateString()}`);
  
  // Chỉ lấy records đã accept, cùng ngày
  const result = await HealthInsuranceExam.findOne(
    {
      status: 'accept',
      order_number: { $ne: null },
      exam_date: { $gte: startOfDay, $lte: endOfDay }
    },
    { order_number: 1 },
    { sort: { order_number: -1 } }
  ).lean();
  
  const maxOrder = result?.order_number || 0;
  console.log(`🔢 [ORDER] Số thứ tự cao nhất tìm thấy: ${maxOrder}, STT tiếp theo: ${maxOrder + 1}`);
  
  return maxOrder;
};

// Search với pagination và indexes
const findByDateRange = async (startDate, endDate, options = {}) => {
  const { page = 1, limit = 20, IdPhongKham, status } = options;
  const skip = (page - 1) * limit;
  
  const filter = { exam_date: { $gte: startDate, $lte: endDate } };
  if (IdPhongKham) filter.IdPhongKham = IdPhongKham;
  if (status) filter.status = status;
  
  return HealthInsuranceExam.find(filter)
    .sort({ exam_date: -1, exam_time: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Atomic update cho order number và status
const updateOrderNumber = async (id, orderNumber, status = 'accept') => {
  const updateData = { status };
  // Chỉ set order_number khi status = 'accept' và orderNumber không null
  if (orderNumber !== null && status === 'accept') {
    updateData.order_number = orderNumber;
  }
  // Nếu status = 'reject' hoặc 'pending', giữ order_number = null
  if (status !== 'accept') {
    updateData.order_number = null;
  }
  return HealthInsuranceExam.findByIdAndUpdate(id, updateData, { new: true });
};

// Phương thức lấy tất cả lịch khám với phân trang
const findAll = async (options = {}) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1, filters = {} } = options;
  
  // Query cơ bản
  const query = { is_deleted: { $ne: true } };
  
  // Thêm các điều kiện lọc từ filter
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query[key] = value;
    }
  });
  
  // Sort options - luôn sắp xếp từ mới đến cũ (-1)
  const sort = {};
  sort[sortBy] = -1; // Luôn sắp xếp giảm dần (mới nhất trước)
  
  // Tính toán skip và tổng số trang
  const skip = (page - 1) * limit;
  const total = await HealthInsuranceExam.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  
  // Lấy dữ liệu theo trang - luôn phân trang với mặc định page=1, limit=10
  const data = await HealthInsuranceExam.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
  
  return {
    data,
    total,
    page: parseInt(page),
    totalPages,
    limit: parseInt(limit)
  };
};

// Cập nhật thông tin lịch khám
const update = async (id, data) => {
  return HealthInsuranceExam.findByIdAndUpdate(id, data, { new: true });
};

// Xóa lịch khám (soft delete)
const remove = async (id) => {
  return HealthInsuranceExam.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
};

export default {
  create,
  findById,
  findMaxOrderNumber,
  findByDateRange,
  updateOrderNumber,
  findAll,
  update,
  remove
};
