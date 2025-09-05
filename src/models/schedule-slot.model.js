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
  clinicRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicRoom',
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

// Performance indexes
ScheduleSlotSchema.index({ date: 1, timeSlot: 1, clinicRoom: 1 }, { unique: true }); // Compound index cho tìm slot
ScheduleSlotSchema.index({ date: 1, is_active: 1 }); // Cho search available slots
ScheduleSlotSchema.index({ clinicRoom: 1, date: 1 }); // Cho filter theo phòng khám

const ScheduleSlot = mongoose.model('ScheduleSlot', ScheduleSlotSchema);

export default ScheduleSlot;
