import mongoose from 'mongoose';

const HealthInsuranceExamSchema = new mongoose.Schema({
  full_name: { type: String, required: true, trim: true },
  phone_number: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  citizen_id: { type: String, required: true, trim: true },
  date_of_birth: { type: Date, required: true },
  gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
  address: { type: String, required: true, trim: true },
  health_insurance_number: { type: String, required: true, trim: true },
  specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
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

export default mongoose.model('HealthInsuranceExam', HealthInsuranceExamSchema);
