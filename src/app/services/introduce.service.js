import introduceRepository from '../repositories/introduce.repository.js';
import cloudinaryService from './cloudinary.service.js';
import { generateSlug } from '../../utils/slug.js';

class IntroduceService {
  /**
   * Validate introduce data
   */
  validateCreateData(data, files) {
    const errors = [];
    
    if (!data.title || !data.title.trim()) {
      errors.push('Tiêu đề giới thiệu là bắt buộc');
    }

    if (!data.content || !data.content.trim()) {
      errors.push('Nội dung giới thiệu là bắt buộc');
    }

    if (data.title && data.title.length > 200) {
      errors.push('Tiêu đề không được vượt quá 200 ký tự');
    }

    if (data.short_description && data.short_description.length > 500) {
      errors.push('Mô tả ngắn không được vượt quá 500 ký tự');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Prepare introduce data for creation
   */
  async prepareCreateData(body, imageUrl) {
    const slug = generateSlug(body.title);
    
    // Check if slug already exists
    const slugExists = await introduceRepository.isSlugExists(slug);
    if (slugExists) {
      throw new Error('Tiêu đề này đã tồn tại, vui lòng sử dụng tiêu đề khác');
    }

    return {
      title: body.title.trim(),
      slug,
      short_description: body.short_description ? body.short_description.trim() : '',
      content: body.content.trim(),
      image: imageUrl || '',
      is_active: body.is_active !== undefined ? body.is_active : true
    };
  }

  /**
   * Create new introduce post
   */
  async createIntroduce(body, files) {
    let imageUrl = null;
    
    try {
      this.validateCreateData(body, files);
      
      // Upload image if provided
      if (files?.image?.[0]) {
        imageUrl = await cloudinaryService.uploadFile(files.image[0]);
      }
      
      const introduceData = await this.prepareCreateData(body, imageUrl);
      const introduce = await introduceRepository.create(introduceData);
      
      return introduce;
    } catch (error) {
      // Delete uploaded image if introduce creation fails
      if (imageUrl) {
        await cloudinaryService.deleteImage(imageUrl);
      }
      throw error;
    }
  }

  /**
   * Get all introduce posts with optional filters
   */
  async getAllIntroduces(filters = {}) {
    const queryFilters = {};
    
    if (filters.is_active !== undefined) {
      queryFilters.is_active = filters.is_active;
    }

    return await introduceRepository.find(queryFilters, {
      sort: { createdAt: -1 }
    });
  }

  /**
   * Get introduce by slug
   */
  async getIntroduceBySlug(slug) {
    const introduce = await introduceRepository.findBySlug(slug);
    if (!introduce) {
      throw new Error('Không tìm thấy trang giới thiệu');
    }
    return introduce;
  }

  /**
   * Get introduce by ID
   */
  async getIntroduceById(id) {
    const introduce = await introduceRepository.findById(id);
    if (!introduce) {
      throw new Error('Không tìm thấy trang giới thiệu');
    }
    return introduce;
  }

  /**
   * Get active introduce posts
   */
  async getActiveIntroduces() {
    return await introduceRepository.findActiveIntroduces();
  }

  /**
   * Get latest introduce posts
   */
  async getLatestIntroduces(limit = 10) {
    return await introduceRepository.findLatestIntroduces(limit);
  }

  /**
   * Search introduce posts
   */
  async searchIntroduces(searchTerm, filters = {}) {
    const queryFilters = { ...filters };
    
    // Default to active introduces unless specified
    if (queryFilters.is_active === undefined) {
      queryFilters.is_active = true;
    }

    return await introduceRepository.searchIntroduces(searchTerm, queryFilters);
  }

  /**
   * Get introduce statistics
   */
  async getIntroduceStats() {
    const stats = await introduceRepository.getIntroduceStats();
    const result = stats[0];
    
    return {
      total: result.total[0]?.count || 0,
      active: result.active[0]?.count || 0,
      inactive: result.inactive[0]?.count || 0
    };
  }

  /**
   * Prepare update data
   */
  async prepareUpdateData(id, body, imageUrl) {
    const updateData = {};

    // Update basic fields
    if (body.title !== undefined) {
      const newTitle = body.title.trim();
      const newSlug = generateSlug(newTitle);
      
      // Check if new slug conflicts with other introduces (excluding current one)
      const slugExists = await introduceRepository.isSlugExists(newSlug, id);
      if (slugExists) {
        throw new Error('Tiêu đề này đã tồn tại, vui lòng sử dụng tiêu đề khác');
      }
      
      updateData.title = newTitle;
      updateData.slug = newSlug;
    }

    if (body.short_description !== undefined) {
      updateData.short_description = body.short_description.trim();
    }

    if (body.content !== undefined) {
      updateData.content = body.content.trim();
    }

    if (body.is_active !== undefined) {
      updateData.is_active = body.is_active;
    }

    // Handle image
    if (imageUrl) {
      updateData.image = imageUrl;
    }

    return updateData;
  }

  /**
   * Update introduce post
   */
  async updateIntroduce(id, body, files) {
    let imageUrl = null;
    
    try {
      const currentIntroduce = await this.getIntroduceById(id);
      
      // Validate field lengths if being updated
      if (body.title && body.title.length > 200) {
        throw new Error('Tiêu đề không được vượt quá 200 ký tự');
      }

      if (body.short_description && body.short_description.length > 500) {
        throw new Error('Mô tả ngắn không được vượt quá 500 ký tự');
      }
      
      // Upload new image if provided
      if (files?.image?.[0]) {
        imageUrl = await cloudinaryService.uploadFile(files.image[0]);
        
        // Delete old image
        if (currentIntroduce.image) {
          await cloudinaryService.deleteImage(currentIntroduce.image);
        }
      }
      
      const updateData = await this.prepareUpdateData(id, body, imageUrl);
      const introduce = await introduceRepository.updateById(id, updateData);
      
      return introduce;
    } catch (error) {
      // Delete uploaded image if update fails
      if (imageUrl) {
        await cloudinaryService.deleteImage(imageUrl);
      }
      throw error;
    }
  }

  /**
   * Delete introduce post
   */
  async deleteIntroduce(id) {
    const introduce = await this.getIntroduceById(id);

    // Delete associated image
    if (introduce.image) {
      await cloudinaryService.deleteImage(introduce.image);
    }

    await introduceRepository.deleteById(id);
    
    return { message: 'Đã xóa trang giới thiệu thành công' };
  }
}

export default new IntroduceService();
