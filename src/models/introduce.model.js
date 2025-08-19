import mongoose from 'mongoose';

const introduceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  short_description: String,
  content: String,
  image: String,
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Introduce = mongoose.model('Introduce', introduceSchema);

export default Introduce;