import mongoose from 'mongoose';

const specialtySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenChuyenKhoa: { type: String, required: true },
  moTa: String,
  hinhAnh: String,
  bacSiLienQuan: [String],
  dichVuLienQuan: [String],
  trangThai: { type: Boolean, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now }
});

const Specialty = mongoose.model('Specialty', specialtySchema);

export default Specialty;