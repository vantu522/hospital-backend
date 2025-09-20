import mongoose from 'mongoose';

const loaiKhamSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    ma: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    ten: {
      type: String,
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
    collection: 'loai_kham',
    _id: false // Disable auto ObjectId generation
  }
);

// Indexes
loaiKhamSchema.index({ _id: 1 });
loaiKhamSchema.index({ ma: 1 });
loaiKhamSchema.index({ is_active: 1 });

const LoaiKham = mongoose.model('LoaiKham', loaiKhamSchema);

export default LoaiKham;
