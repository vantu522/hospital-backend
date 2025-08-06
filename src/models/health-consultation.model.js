import mongoose from 'mongoose';

const healthConsultationSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true
  }
  ,
  slug: {
    type:String
  },
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
  specialty_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    required: [true, 'Specialty is required']
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
healthConsultationSchema.index({ specialty_id: 1 });
healthConsultationSchema.index({ is_active: 1 });
healthConsultationSchema.index({ createdAt: -1 });

// NOTE: Khi sử dụng, chỉ populate field 'name' để tránh tràn data:
// .populate('specialty_id', 'name')

const HealthConsultation = mongoose.model('HealthConsultation', healthConsultationSchema);

export default HealthConsultation;
