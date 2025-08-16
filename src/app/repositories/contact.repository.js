import BaseRepository from './base.repository.js';
import Contact from '../../models/contact.js';

class ContactRepository extends BaseRepository {
  constructor() {
    super(Contact);
  }

  /**
   * Find contacts by date range
   */
  async findByDateRange(startDate, endDate) {
    return await this.model
      .find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
      .sort({ createdAt: -1 });
  }

  /**
   * Find contacts by email
   */
  async findByEmail(email) {
    return await this.model
      .find({ email: { $regex: email, $options: 'i' } })
      .sort({ createdAt: -1 });
  }

  /**
   * Find contacts by phone number
   */
  async findByPhone(phoneNumber) {
    return await this.model
      .find({ phone_number: { $regex: phoneNumber, $options: 'i' } })
      .sort({ createdAt: -1 });
  }

  /**
   * Search contacts
   */
  async searchContacts(searchTerm, filters = {}) {
    const query = {
      $and: [
        {
          $or: [
            { full_name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { phone_number: { $regex: searchTerm, $options: 'i' } },
            { message: { $regex: searchTerm, $options: 'i' } }
          ]
        },
        filters
      ]
    };

    return await this.model
      .find(query)
      .sort({ createdAt: -1 });
  }

  /**
   * Get latest contacts
   */
  async findLatestContacts(limit = 10) {
    return await this.model
      .find()
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Get all contacts simple list
   */
  async findAllContacts() {
    return await this.model
      .find()
      .sort({ createdAt: -1 });
  }

  /**
   * Get contact statistics
   */
  async getContactStats() {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total count
    const total = await this.model.countDocuments();

    // Get today's count
    const today = await this.model.countDocuments({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    });

    // Get this week's count
    const thisWeek = await this.model.countDocuments({
      createdAt: {
        $gte: startOfWeek
      }
    });

    // Get this month's count
    const thisMonth = await this.model.countDocuments({
      createdAt: {
        $gte: startOfMonth
      }
    });

    // Get monthly breakdown
    const byMonth = await this.model.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    return {
      total,
      today,
      thisWeek,
      thisMonth,
      byMonth
    };
  }

  /**
   * Get contacts with pagination and filtering
   */
  async findWithPagination(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Apply filters
    if (filters.startDate && filters.endDate) {
      query.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    if (filters.email) {
      query.email = { $regex: filters.email, $options: 'i' };
    }
    
    if (filters.phone) {
      query.phone_number = { $regex: filters.phone, $options: 'i' };
    }

    if (filters.search) {
      query.$or = [
        { full_name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone_number: { $regex: filters.search, $options: 'i' } },
        { message: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(query)
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    };
  }
}

export default new ContactRepository();
