import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  position: String,
  specialty_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    required: [true, 'Specialty is required']
  },
  description: String,
  requirements: [String],
  benefits: [String],
  deadline: Date,
  location: String,
  contact_email: String,
  recruitment_count: {
    type: Number,
    required: [true, 'Recruitment count is required'],
    min: [1, 'Recruitment count must be at least 1']
  },
  expiry_date: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  document: {
    type: String, // File path for uploaded document
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes - chỉ index cần thiết
recruitmentSchema.index({ specialty_id: 1 });
recruitmentSchema.index({ expiry_date: 1 }); // Để query recruitment còn hiệu lực
recruitmentSchema.index({ slug: 1 }, { unique: true }); // Index cho slug lookup

// NOTE: Khi sử dụng, chỉ populate field 'name' để tránh tràn data:
// .populate('specialty_id', 'name')

const Recruitment = mongoose.model('Recruitment', recruitmentSchema);

export default Recruitment;