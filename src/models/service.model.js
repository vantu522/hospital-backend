import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialties: { type: String, required: true },
  description: { type: String, required: false },
  avatar: { type: String, required: false },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;