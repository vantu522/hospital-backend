import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
    default: "",
  },
  cvFileUrl: {
    type: String, // File đính kèm nếu có
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
