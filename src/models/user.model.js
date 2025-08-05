import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'user'],
    default: 'user'
  }
}, { 
  timestamps: true 
});

// Hash password trước khi save
userSchema.pre('save', async function(next) {
  // Chỉ hash nếu password được thay đổi
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method để tạo object response không có password
userSchema.methods.toAuthJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
