import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  specialties: { type: String, required: true },
  expertise_fields: [{ type: String }],
  hospital: String,
  department: String,
  
  degree: String,
  description: String,
  experience: [{type:String}],
  
  avatar: String,
  certifications: [{type: String}],
  phone_number: String,
  email: String,
  work_address: String,
  
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
