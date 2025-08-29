import ScheduleSlot from '../models/schedule-slot.model.js';

const ScheduleSlotService = {
  async createSlot(data) {
    return await ScheduleSlot.create(data);
  },
  async getSlots() {
  return await ScheduleSlot.find().populate('clinicRoom');
  },
  async deleteSlot(id) {
    return await ScheduleSlot.findByIdAndDelete(id);
  }
};

export default ScheduleSlotService;
