import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  specialties: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' },

  hospital: { type: String, default: 'Bệnh Viện Đa Khoa Đức Thọ' }, // Sửa lỗi default
  department: { type: String, default: '' }, // Sửa lỗi default
  degree: { type: String, default: '' }, // Sửa lỗi default
  description: { type: String, default: '' }, // Sửa lỗi default
  experience:        { type: [String], default: [] },
  certifications:    { type: [String], default: [] },
  expertise_fields:  { type: [String], default: [] },
  training_process:  { type: [String], default: [] },
  slug:              { type: String,  default: "" },
  avatar:            { type: String,  default: "" },
  phone_number:      { type: String,  default: "" },
  email:             { type: String,  default: "" },
  work_address:      { type: String,  default: "" },
  is_active: { type: Boolean, default: true },
  role: {
    type: String,
    enum: [
      'GIAM_DOC',
      'PHO_GIAM_DOC',
      'TRUONG_PHONG',
      'TRUONG_KHOA',
      'PHO_TRUONG_KHOA',
      'PHO_TRUONG_PHONG',
      'DIEU_DUONG_TRUONG',
      'KHAC'
    ],
    default: 'KHAC'
  },
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;