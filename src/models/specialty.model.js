import mongoose from 'mongoose';

const specialtySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  images: [{ type: String }],
  functions: [{ type: String }],
  
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Specialty = mongoose.model('Specialty', specialtySchema);

export default Specialty;