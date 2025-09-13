import mongoose from 'mongoose';

const HealthInsuranceExamSchema = new mongoose.Schema({
  HoTen: { type: String, required: true, trim: true },
  DienThoai: { type: String, trim: true },
  email: { type: String, trim: true },
  CCCD: { type: String, trim: true },
  NgaySinh: { type: Date, required: true },
  GioiTinh: { type: String, required: true, enum: ['Nam', 'Nữ', 'Khác'] },
  DiaChi: { type: String, required: true, trim: true },
  BHYT: { type: String, trim: true }, // BHYT 
  IdPhongKham: { type: String, ref: 'PhongKham', required: true },
  
  // Thông tin phòng khám
  MaPhongKham: { type: String, required: true, trim: true },
  TenPhongKham: { type: String, required: true, trim: true },
  
  // Thông tin loại khám
  IdLoaiKham: { type: String, required: true, trim: true },
  
  // Thông tin địa chỉ
  MaTinh: { type: String, required: true, trim: true },
  TenTinh: { type: String, required: true, trim: true },
  IdTinhThanh: { type: String, required: true, trim: true },
  MaXa: { type: String, required: true, trim: true },
  TenXa: { type: String, required: true, trim: true },
  IdXaPhuong: { type: String, required: true, trim: true },
  
  // Thông tin khác
  IdDanToc: { type: String, required: true, trim: true },
  TenDanToc: { type: String, required: true, trim: true },
  IdQuocTich: { type: String, required: true, trim: true },
  IdKhoaKham: { type: String, required: true, trim: true },
  IdNgheNghiep: { type: String, required: true, trim: true },
  TenNgheNghiep: { type: String, required: true, trim: true },
  IdCanBoDonTiep: { type: String,  trim: true },
  IdBenhVien: { type: String,  trim: true },
  
  exam_type: {
    type: String,
    enum: ['BHYT', 'DV'],
    required: true,
  },
  slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduleSlot',
      required: true,
  },
  IsDonTiepCCCD: { type: Boolean, required: true },
  
  exam_date: { type: Date, required: true },
  exam_time: { type: String, required: true },
  symptoms: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'accept', 'reject'], default: 'pending' },
  is_priority: { type: Boolean, default: false },
  order_number: { type: Number, default: null },
}, { timestamps: true });

// Performance indexes
HealthInsuranceExamSchema.index({ order_number: -1 }); // Cho việc tìm max order
HealthInsuranceExamSchema.index({ exam_date: 1, status: 1 }); // Cho search theo ngày và status
HealthInsuranceExamSchema.index({ IdPhongKham: 1, exam_date: 1 }); // Cho filter theo phòng khám
HealthInsuranceExamSchema.index({ BHYT: 1 }); // Cho check BHYT
HealthInsuranceExamSchema.index({ CCCD: 1 }); // Cho search theo CCCD

export default mongoose.model('HealthInsuranceExam', HealthInsuranceExamSchema);
