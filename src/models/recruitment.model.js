import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  position: String,
  department_id: String,
  description: String,
  requirements: [String],
  benefits: [String],
  deadline: Date,
  location: String,
  contact_email: String
}, {
  timestamps: true
});

const Recruitment = mongoose.model('Recruitment', recruitmentSchema);

export default Recruitment;