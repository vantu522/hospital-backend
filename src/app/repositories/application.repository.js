import BaseRepository from './base.repository.js';
import Application from '../../models/application.model.js';

class ApplicationRepository extends BaseRepository {
  constructor() {
    super(Application);
  }

  async findByStatus(status) {
    return await this.find({ status }, {
      sort: { createdAt: -1 }
    });
  }

  async findByEmail(email) {
    return await this.find({ email: email.toLowerCase() }, {
      sort: { createdAt: -1 }
    });
  }

  async findPendingApplications() {
    return await this.find({ status: 'pending' }, {
      sort: { createdAt: -1 }
    });
  }

  async getApplicationStats() {
    return await this.model.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async findWithPagination(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [data, total] = await Promise.all([
      this.model.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    };
  }
}

export default new ApplicationRepository();
