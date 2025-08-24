import TimeSlotTemplate from '../models/time-slot-template.model.js';

class TimeSlotTemplateRepository {
  async create(data) {
    return await TimeSlotTemplate.create(data);
  }

  async findAll() {
    return await TimeSlotTemplate.find({ is_active: true });
  }

  async deleteById(id) {
    return await TimeSlotTemplate.findByIdAndDelete(id);
  }
}

export default new TimeSlotTemplateRepository();
