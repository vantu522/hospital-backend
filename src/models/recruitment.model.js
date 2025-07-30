import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  position: String,
  departmentId: String,
  description: String,
  requirements: [String],
  benefits: [String],
  deadline: Date,
  location: String,
  contactEmail: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Recruitment = mongoose.model('Recruitment', recruitmentSchema);

export default Recruitment;