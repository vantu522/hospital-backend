import TimeSlotTemplateRepository from '../repositories/time-slot-template.repository.js';

class TimeSlotTemplateService {
  async createTemplate(data) {
    return await TimeSlotTemplateRepository.create(data);
  }

  async getTemplates() {
    const templates = await TimeSlotTemplateRepository.findAll();
    // Sắp xếp theo trường time tăng dần (giả sử time là chuỗi 'HH:mm')
    templates.sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return ah !== bh ? ah - bh : am - bm;
    });
    return templates;
  }

  async deleteTemplate(id) {
    return await TimeSlotTemplateRepository.deleteById(id);
  }
}

export default new TimeSlotTemplateService();
