import BaseRepository from './base.repository.js';
import Recruitment from '../../models/recruitment.model.js';

class RecruitmentRepository extends BaseRepository {
  constructor() {
    super(Recruitment);
  }

  async findBySlug(slug) {
    return await this.findOne({ slug });
  }

  async findActiveRecruitments() {
    const currentDate = new Date();
    return await this.find({ 
      expiry_date: { $gte: currentDate }
    }, { 
      sort: { createdAt: -1 } 
    });
  }

  async findExpiredRecruitments() {
    const currentDate = new Date();
    return await this.find({ 
      expiry_date: { $lt: currentDate }
    }, { 
      sort: { expiry_date: -1 } 
    });
  }

  async findLatestRecruitments(limit = 10) {
    return await this.find({}, {
      sort: { createdAt: -1 },
      limit
    });
  }

  async searchRecruitments(searchTerm, filters = {}) {
    const query = { ...filters };
    
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { position: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    return await this.find(query, {
      sort: { createdAt: -1 }
    });
  }

  async getRecruitmentStats() {
    const currentDate = new Date();
    return await this.model.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [
            { $match: { expiry_date: { $gte: currentDate } } },
            { $count: "count" }
          ],
          expired: [
            { $match: { expiry_date: { $lt: currentDate } } },
            { $count: "count" }
          ]
        }
      }
    ]);
  }
}

export default new RecruitmentRepository();
