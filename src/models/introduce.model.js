import mongoose from 'mongoose';

const introduceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tieuDe: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  moTaNgan: String,
  noiDung: String,
  hinhAnh: String,
  trangThai: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Introduce = mongoose.model('Introduce', introduceSchema);

export default Introduce;