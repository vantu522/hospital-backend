import BaseRepository from './base.repository.js';
import Doctor from '../../models/doctor.model.js';

class DoctorRepository extends BaseRepository {
  constructor() {
    super(Doctor);
  }

  async findBySlug(slug) {
    return await this.findOne({ slug }, 'specialties');
  }

  async findActiveDoctor() {
    return await this.find({ is_active: true }, { 
      populate: 'specialties',
      sort: { full_name: 1 } 
    });
  }

  async findBySpecialty(specialtyId) {
    return await this.find({ specialties: specialtyId }, {
      populate: { path: 'specialties', select: 'name slug' }
    });
  }

  async findFiveRandomDoctors() {
    return await this.model.aggregate([
      { $match: { is_active: true } },
      { $sample: { size: 5 } },
      {
        $lookup: {
          from: 'specialties',
          localField: 'specialties',
          foreignField: '_id',
          as: 'specialties'
        }
      }
    ]);
  }

  async searchDoctors(searchTerm, filters = {}) {
    const query = { ...filters };
    
    if (searchTerm) {
      query.$or = [
        { full_name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { expertise_fields: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    return await this.find(query, {
      populate: { path: 'specialties', select: 'name slug' },
      sort: { full_name: 1 }
    });
  }

  async countBySpecialty(specialtyId) {
    return await this.count({ specialties: specialtyId });
  }
}

export default new DoctorRepository();
