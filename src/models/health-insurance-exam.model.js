import mongoose from 'mongoose';

const HealthInsuranceExamSchema = new mongoose.Schema({
  full_name: { type: String, required: true, trim: true },
  phone_number: { type: String, trim: true },
  email: { type: String, trim: true },
  citizen_id: { type: String, trim: true },
  date_of_birth: { type: Date, required: true },
  gender: { type: String, required: true, enum: ['Nam', 'Nữ', 'Khác'] },
  address: { type: String, required: true, trim: true },
  health_insurance_number: { type: String, trim: true }, // BHYT 
  phongKham: { type: mongoose.Schema.Types.ObjectId, ref: 'PhongKham', required: true },
  exam_type: {
    type: String,
    enum: ['BHYT', 'DV'],
    required: true,
  },
  slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduleSlot',
      required: true,
  },
  
  exam_date: { type: Date, required: true },
  exam_time: { type: String, required: true },
  symptoms: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'accept', 'reject'], default: 'pending' },
  is_priority: { type: Boolean, default: false },
  order_number: { type: Number, default: null },
}, { timestamps: true });

// Performance indexes
HealthInsuranceExamSchema.index({ order_number: -1 }); // Cho việc tìm max order
HealthInsuranceExamSchema.index({ exam_date: 1, status: 1 }); // Cho search theo ngày và status
HealthInsuranceExamSchema.index({ phongKham: 1, exam_date: 1 }); // Cho filter theo phòng khám
HealthInsuranceExamSchema.index({ health_insurance_number: 1 }); // Cho check BHYT
HealthInsuranceExamSchema.index({ citizen_id: 1 }); // Cho search theo CCCD

export default mongoose.model('HealthInsuranceExam', HealthInsuranceExamSchema);
