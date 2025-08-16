import BaseRepository from './base.repository.js';
import Service from '../../models/service.model.js';

class ServiceRepository extends BaseRepository {
  constructor() {
    super(Service);
  }

  async findBySlug(slug) {
    return await this.findOne({ slug }, 'specialties');
  }

  async findActiveServices() {
    return await this.find({ is_active: true }, { 
      populate: { path: 'specialties', select: 'name slug' },
      sort: { name: 1 } 
    });
  }

  async findBySpecialty(specialtyId) {
    return await this.find({ specialties: specialtyId }, {
      populate: { path: 'specialties', select: 'name slug' }
    });
  }

  async searchServices(searchTerm, filters = {}) {
    const query = { ...filters };
    
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { features: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    return await this.find(query, {
      populate: { path: 'specialties', select: 'name slug' },
      sort: { name: 1 }
    });
  }

  async countBySpecialty(specialtyId) {
    return await this.count({ specialties: specialtyId });
  }

  async getFeaturedServices(limit = 6) {
    return await this.find({ is_active: true }, {
      populate: { path: 'specialties', select: 'name slug' },
      sort: { createdAt: -1 },
      limit
    });
  }
}

export default new ServiceRepository();
