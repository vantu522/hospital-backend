import backgroundBannerRepository from '../repositories/background-banner.repository.js';
import cloudinaryService from './cloudinary.service.js';

class BackgroundBannerService {
  /**
   * Validate banner data
   */
  validateCreateData(data, files) {
    const errors = [];
    
    if (!files?.image?.[0]) {
      errors.push('Ảnh banner là bắt buộc');
    }

    if (!data.description || !data.description.trim()) {
      errors.push('Mô tả banner là bắt buộc');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Prepare banner data for creation
   */
  async prepareCreateData(body, files) {
    const { description } = body;

    return {
      image: files?.image?.[0] ? await cloudinaryService.uploadFile(files.image[0]) : '',
      description: description.trim()
    };
  }

  /**
   * Create new background banner
   */
  async createBackgroundBanner(body, files) {
    this.validateCreateData(body, files);
    const bannerData = await this.prepareCreateData(body, files);
    return await backgroundBannerRepository.create(bannerData);
  }

  /**
   * Get all background banners
   */
  async getAllBackgroundBanners() {
    return await backgroundBannerRepository.find({}, {
      sort: { createdAt: -1 }
    });
  }

  /**
   * Get banner by ID
   */
  async getBackgroundBannerById(id) {
    const banner = await backgroundBannerRepository.findById(id);
    if (!banner) {
      throw new Error('Không tìm thấy banner');
    }
    return banner;
  }

  /**
   * Get random banner
   */
  async getRandomBanner() {
    const banners = await backgroundBannerRepository.findRandom(1);
    return banners[0] || null;
  }

  /**
   * Prepare update data
   */
  async prepareUpdateData(body, files) {
    const updateData = {};

    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }

    if (files?.image?.[0]) {
      updateData.image = await cloudinaryService.uploadFile(files.image[0]);
    }

    return updateData;
  }

  /**
   * Update background banner
   */
  async updateBackgroundBanner(id, body, files) {
    const currentBanner = await this.getBackgroundBannerById(id);
    const updateData = await this.prepareUpdateData(body, files);
    // Delete old image if new one is uploaded
    if (files?.image?.[0] && currentBanner.image) {
      await cloudinaryService.deleteImage(currentBanner.image);
    }
    return await backgroundBannerRepository.updateById(id, updateData);
  }

  /**
   * Delete background banner
   */
  async deleteBackgroundBanner(id) {
    const banner = await this.getBackgroundBannerById(id);

    // Delete image from cloudinary
    if (banner.image) {
      await cloudinaryService.deleteImage(banner.image);
    }

    await backgroundBannerRepository.deleteById(id);
    
    return { message: 'Đã xóa banner thành công' };
  }
}

export default new BackgroundBannerService();
