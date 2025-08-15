import BaseRepository from './base.repository.js';
import BackgroundBanner from '../../models/background-banner.model.js';

class BackgroundBannerRepository extends BaseRepository {
  constructor() {
    super(BackgroundBanner);
  }

  async findAllActive() {
    return await this.find({ is_active: true }, {
      sort: { createdAt: -1 }
    });
  }

  async findRandom(limit = 1) {
    return await this.model.aggregate([
      { $sample: { size: limit } }
    ]);
  }
}

export default new BackgroundBannerRepository();
