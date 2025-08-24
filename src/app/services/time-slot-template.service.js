import TimeSlotTemplateRepository from '../repositories/time-slot-template.repository.js';

class TimeSlotTemplateService {
  async createTemplate(data) {
    return await TimeSlotTemplateRepository.create(data);
  }

  async getTemplates() {
    return await TimeSlotTemplateRepository.findAll();
  }

  async deleteTemplate(id) {
    return await TimeSlotTemplateRepository.deleteById(id);
  }
}

export default new TimeSlotTemplateService();
