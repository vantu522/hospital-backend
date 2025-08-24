import mongoose from 'mongoose';

const ScheduleSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  currentCount: {
    type: Number,
    default: 0,
  },
  is_active: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

const ScheduleSlot = mongoose.model('ScheduleSlot', ScheduleSlotSchema);

export default ScheduleSlot;
