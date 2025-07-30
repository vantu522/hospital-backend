import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  hoTen: { type: String, required: true },
  chuyenKhoa: { type: String, required: true },
  hocVi: String,
  moTa: String,
  kinhNghiem: Number,
  lichKham: [{
    thu: String,
    khungGio: [String],
  }],
  avatarUrl: String,
  bangCap: [String],
  soDienThoai: String,
  email: String,
  diaChiLamViec: String,
  danhGia: { type: Number, default: 0 },
  luotDanhGia: { type: Number, default: 0 },
  trangThai: { type: Boolean, default: true },
}, {
  timestamps: true 
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;