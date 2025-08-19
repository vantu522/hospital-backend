import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  specialties: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' },

  hospital: String,
  department: String,
  degree: String,
  description: String,
  experience: [{type:String}],
  certifications: [{type: String}],
  expertise_fields: [{ type: String }],
  training_process: [{ type: String }],
  slug: { type: String },
  avatar: String,
  phone_number: String,
  email: String,
  work_address: String,
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
