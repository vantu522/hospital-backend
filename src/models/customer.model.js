import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const customerSchema = new mongoose.Schema({
  // Personal Information
  full_name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  phone_number: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  citizen_id: {
    type: String,
    trim: true
  },
  date_of_birth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Nam', 'Nữ', 'Khác']
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  health_insurance_number: {
    type: String,
    trim: true
  },

  // Account Information
  password: {
    type: String,
    minlength: 6
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user','receptionist']
  }
}, {
  timestamps: true
});

// Indexes
customerSchema.index({ phone_number: 1 }, { unique: true });
customerSchema.index({ email: 1 }, { unique: true, sparse: true });

// Hash password before save
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
customerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Convert to JSON for authentication response
customerSchema.methods.toAuthJSON = function() {
  return {
    id: this._id,
    full_name: this.full_name,
    phone_number: this.phone_number,
    email: this.email,
    citizen_id: this.citizen_id,
    date_of_birth: this.date_of_birth,
    gender: this.gender,
    address: this.address,
    health_insurance_number: this.health_insurance_number,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Convert to JSON for public response (without sensitive data)
customerSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    full_name: this.full_name,
    phone_number: this.phone_number,
    email: this.email,
    citizen_id: this.citizen_id,
    date_of_birth: this.date_of_birth,
    gender: this.gender,
    address: this.address,
    health_insurance_number: this.health_insurance_number,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
