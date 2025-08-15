import BaseRepository from './base.repository.js';
import Introduce from '../../models/introduce.model.js';

class IntroduceRepository extends BaseRepository {
  constructor() {
    super(Introduce);
  }

  /**
   * Find introduce by slug
   */
  async findBySlug(slug) {
    return await this.model.findOne({ slug });
  }

  /**
   * Find active introduce posts
   */
  async findActiveIntroduces() {
    return await this.model.find({ is_active: true }).sort({ createdAt: -1 });
  }

  /**
   * Find latest introduce posts
   */
  async findLatestIntroduces(limit = 10) {
    return await this.model
      .find({ is_active: true })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Search introduce posts
   */
  async searchIntroduces(searchTerm, filters = {}) {
    const query = {
      $and: [
        {
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { short_description: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } }
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
   * Get introduce statistics
   */
  async getIntroduceStats() {
    return await this.model.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [
            { $match: { is_active: true } },
            { $count: "count" }
          ],
          inactive: [
            { $match: { is_active: false } },
            { $count: "count" }
          ]
        }
      }
    ]);
  }

  /**
   * Check if slug exists (excluding specific ID)
   */
  async isSlugExists(slug, excludeId = null) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await this.exists(query);
  }
}

export default new IntroduceRepository();
