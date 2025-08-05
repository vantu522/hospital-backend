import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialties: { type: String, required: true },
  description: { type: String, required: false },
  slug: { type: String, required: true, unique: true },
  avatar: { type: String, required: false },
  images: [{ type: String }],
  features: [{ type: String }],
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;