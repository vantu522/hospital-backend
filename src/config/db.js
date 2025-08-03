import mongoose from 'mongoose';
import { MONGO_URI } from './constants.js';
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
