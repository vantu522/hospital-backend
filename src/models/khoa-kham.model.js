import mongoose from 'mongoose';

const khoaKhamSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    ma: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    ten: {
      type: String,
      required: true,
      trim: true
    },
    dia_chi: {
      type: String,
    
      trim: true
    },
    cap_quan_li: {
      type: String,
      default: 'Khoa',
      required: true,
      trim: true
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'khoa_kham',
    _id: false // Disable auto ObjectId generation
  }
);

// Indexes
khoaKhamSchema.index({ _id: 1 });
khoaKhamSchema.index({ ma: 1 });
khoaKhamSchema.index({ is_active: 1 });
khoaKhamSchema.index({ cap_quan_li: 1 });

const KhoaKham = mongoose.model('KhoaKham', khoaKhamSchema);

export default KhoaKham;
