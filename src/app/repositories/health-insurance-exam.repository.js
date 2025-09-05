import HealthInsuranceExam from '../../models/health-insurance-exam.model.js';

const create = async (data) => HealthInsuranceExam.create(data);

const findById = async (id) => HealthInsuranceExam.findById(id).lean(); // Use lean() for better performance

// Tìm max order number với projection để giảm data transfer
const findMaxOrderNumber = async () => {
  const result = await HealthInsuranceExam.findOne(
    {}, 
    { order_number: 1 }, 
    { sort: { order_number: -1 } }
  ).lean();
  return result?.order_number || 0;
};

// Search với pagination và indexes
const findByDateRange = async (startDate, endDate, options = {}) => {
  const { page = 1, limit = 20, clinicRoom, status } = options;
  const skip = (page - 1) * limit;
  
  const filter = { exam_date: { $gte: startDate, $lte: endDate } };
  if (clinicRoom) filter.clinicRoom = clinicRoom;
  if (status) filter.status = status;
  
  return HealthInsuranceExam.find(filter)
    .populate('clinicRoom', 'name')
    .sort({ exam_date: -1, exam_time: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Atomic update cho order number và status
const updateOrderNumber = async (id, orderNumber, status = 'accept') => {
  const updateData = { status };
  if (orderNumber !== null) {
    updateData.order_number = orderNumber;
  }
  return HealthInsuranceExam.findByIdAndUpdate(id, updateData, { new: true });
};

export default {
  create,
  findById,
  findMaxOrderNumber,
  findByDateRange,
  updateOrderNumber
};
