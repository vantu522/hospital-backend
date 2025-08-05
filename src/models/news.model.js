import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  noiDung: String,
  hinhAnh: String,
  tacGia: String,
  chuyenMuc: String,
  tags: [String],
  ngayDang: { type: Date, default: Date.now },
  trangThai: { type: Boolean, default: true },
  luotXem: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const News = mongoose.model('News', newsSchema);

export default News;