import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  content: String,
  image: String,
  category: String,
  tags: [String],
  publish_date: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true },
  view_count: { type: Number, default: 0 }
}, {
  timestamps: true
});

const News = mongoose.model('News', newsSchema);

export default News;