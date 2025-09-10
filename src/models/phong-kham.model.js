import mongoose from 'mongoose';

const phongKhamSchema = new mongoose.Schema(
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
      required: true,
      trim: true,
      default: 'Phòng'
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'phong_kham',
    _id: false // Disable auto ObjectId generation
  }
);

// Indexes
phongKhamSchema.index({ _id: 1 });
phongKhamSchema.index({ ma: 1 });
phongKhamSchema.index({ is_active: 1 });
phongKhamSchema.index({ cap_quan_li: 1 });

const PhongKham = mongoose.model('PhongKham', phongKhamSchema);

export default PhongKham;
