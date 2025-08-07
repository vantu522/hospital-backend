import mongoose from 'mongoose';

const backgroundBannerSchema = new mongoose.Schema({
  image: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true
});

const BackgroundBanner = mongoose.model('BackgroundBanner', backgroundBannerSchema);

export default BackgroundBanner;
