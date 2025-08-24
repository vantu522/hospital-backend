import mongoose from 'mongoose';

const timeSlotTemplateSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const TimeSlotTemplate = mongoose.model('TimeSlotTemplate', timeSlotTemplateSchema);

export default TimeSlotTemplate;
