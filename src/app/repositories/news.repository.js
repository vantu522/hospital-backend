import BaseRepository from './base.repository.js';
import News from '../../models/news.model.js';

class NewsRepository extends BaseRepository {
  constructor() {
    super(News);
  }

  async findBySlug(slug) {
    return await this.findOne({ slug });
  }

  async findActiveNews() {
    return await this.find({ is_active: true }, { 
      sort: { publish_date: -1 } 
    });
  }

  async findByCategory(category) {
    return await this.find({ category, is_active: true }, {
      sort: { publish_date: -1 }
    });
  }

  async findLatestNews(limit = 10) {
    return await this.find({ is_active: true }, {
      sort: { publish_date: -1 },
      limit
    });
  }

  async findFeaturedNews(limit = 5) {
    return await this.find({ is_active: true }, {
      sort: { view_count: -1 },
      limit
    });
  }

  async searchNews(searchTerm, filters = {}) {
    const query = { ...filters };
    
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    return await this.find(query, {
      sort: { publish_date: -1 }
    });
  }

  async incrementViewCount(id) {
    return await this.model.findByIdAndUpdate(
      id, 
      { $inc: { view_count: 1 } },
      { new: true }
    );
  }

  async getNewsStatistics() {
    return await this.model.aggregate([
      {
        $group: {
          _id: null,
          totalNews: { $sum: 1 },
          activeNews: {
            $sum: { $cond: [{ $eq: ['$is_active', true] }, 1, 0] }
          },
          totalViews: { $sum: '$view_count' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);
  }
}

export default new NewsRepository();
