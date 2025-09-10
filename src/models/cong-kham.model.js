import mongoose from 'mongoose';

const congKhamSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    ma_bv: {
      type: String,
      required: true,
      trim: true
    },
    ma_bhyt: {
      type: String,
      required: true,
      trim: true
    },
    ten_bv: {
      type: String,
      required: true,
      trim: true
    },
    ten_bhyt: {
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
    collection: 'cong_kham',
    _id: false // Disable auto ObjectId generation
  }
);

// Indexes
congKhamSchema.index({ _id: 1 });
congKhamSchema.index({ ma_bv: 1 });
congKhamSchema.index({ ma_bhyt: 1 });
congKhamSchema.index({ is_active: 1 });

const CongKham = mongoose.model('CongKham', congKhamSchema);

export default CongKham;
