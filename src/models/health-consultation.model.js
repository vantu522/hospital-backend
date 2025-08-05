import mongoose from 'mongoose';

const healthConsultationSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Image is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'health_consultations'
});

// Create indexes
healthConsultationSchema.index({ department_id: 1 });
healthConsultationSchema.index({ is_active: 1 });
healthConsultationSchema.index({ createdAt: -1 });

// NOTE: Khi sử dụng, chỉ populate field 'name' để tránh tràn data:
// .populate('department_id', 'name')

const HealthConsultation = mongoose.model('HealthConsultation', healthConsultationSchema);

export default HealthConsultation;
