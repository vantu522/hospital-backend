import BaseRepository from './base.repository.js';
import HealthConsultation from '../../models/health-consultation.model.js';

class HealthConsultationRepository extends BaseRepository {
  constructor() {
    super(HealthConsultation);
  }

  async findBySlug(slug) {
    return await this.findOne({ slug }, 'specialty_id');
  }

  async findActiveConsultations() {
    return await this.find({ is_active: true }, { 
      populate: { path: 'specialty_id', select: 'name slug' },
      sort: { createdAt: -1 } 
    });
  }

  async findBySpecialty(specialtyId) {
    return await this.find({ 
      specialty_id: specialtyId, 
      is_active: true 
    }, {
      populate: { path: 'specialty_id', select: 'name slug' },
      sort: { createdAt: -1 }
    });
  }

  async findLatestConsultations(limit = 10) {
    return await this.find({ is_active: true }, {
      populate: { path: 'specialty_id', select: 'name slug' },
      sort: { createdAt: -1 },
      limit
    });
  }

  async searchConsultations(searchTerm, filters = {}) {
    const query = { ...filters };
    
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    return await this.find(query, {
      populate: { path: 'specialty_id', select: 'name slug' },
      sort: { createdAt: -1 }
    });
  }

  async countBySpecialty(specialtyId) {
    return await this.count({ 
      specialty_id: specialtyId, 
      is_active: true 
    });
  }

  async getConsultationStats() {
    return await this.model.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [
            { $match: { is_active: true } },
            { $count: "count" }
          ],
          bySpecialty: [
            { $match: { is_active: true } },
            {
              $group: {
                _id: '$specialty_id',
                count: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: 'specialties',
                localField: '_id',
                foreignField: '_id',
                as: 'specialty'
              }
            },
            {
              $project: {
                specialty: { $arrayElemAt: ['$specialty.name', 0] },
                count: 1
              }
            }
          ]
        }
      }
    ]);
  }
}

export default new HealthConsultationRepository();
