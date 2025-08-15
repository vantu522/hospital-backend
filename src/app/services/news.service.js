import newsRepository from '../repositories/news.repository.js';
import cloudinaryService from './cloudinary.service.js';
import { generateSlug } from '../../utils/slug.js';

class NewsService {
  /**
   * Validate news data
   */
  validateCreateData(data) {
    const errors = [];
    
    if (!data.title || !data.title.trim()) {
      errors.push('Tiêu đề tin tức là bắt buộc');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Prepare news data for creation
   */
  prepareCreateData(body, files) {
    const { title, description, content, category, tags, author } = body;

    return {
      title: title.trim(),
      slug: generateSlug(title),
      description: description || '',
      content: content || '',
      category: category || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      author: author || '',
      image: cloudinaryService.uploadFile(files?.image?.[0]) || '',
      publish_date: new Date(),
      is_active: true,
      view_count: 0
    };
  }

  /**
   * Create new news
   */
  async createNews(body, files) {
    this.validateCreateData(body);
    
    const newsData = this.prepareCreateData(body, files);
    return await newsRepository.create(newsData);
  }

  /**
   * Get all news with optional filters
   */
  async getAllNews(filters = {}) {
    const queryFilters = {};
    
    if (filters.category) {
      queryFilters.category = filters.category;
    }

    if (filters.is_active !== undefined) {
      queryFilters.is_active = filters.is_active;
    }

    if (filters.author) {
      queryFilters.author = filters.author;
    }

    const news = await newsRepository.find(queryFilters, {
      sort: { publish_date: -1 }
    });

    return {
      success: true,
      count: news.length,
      data: news
    };
  }

  /**
   * Get news by slug
   */
  async getNewsBySlug(slug) {
    const news = await newsRepository.findBySlug(slug);
    if (!news) {
      throw new Error('Không tìm thấy tin tức');
    }

    // Increment view count
    await newsRepository.incrementViewCount(news._id);
    
    return { ...news.toObject(), view_count: news.view_count + 1 };
  }

  /**
   * Get news by ID
   */
  async getNewsById(id) {
    const news = await newsRepository.findById(id);
    if (!news) {
      throw new Error('Không tìm thấy tin tức');
    }
    return news;
  }

  /**
   * Get latest news
   */
  async getLatestNews(limit = 10) {
    return await newsRepository.findLatestNews(limit);
  }

  /**
   * Get featured news (most viewed)
   */
  async getFeaturedNews(limit = 5) {
    return await newsRepository.findFeaturedNews(limit);
  }

  /**
   * Get news by category
   */
  async getNewsByCategory(category) {
    return await newsRepository.findByCategory(category);
  }

  /**
   * Search news
   */
  async searchNews(searchTerm, filters = {}) {
    return await newsRepository.searchNews(searchTerm, filters);
  }

  /**
   * Get news statistics
   */
  async getNewsStatistics() {
    const stats = await newsRepository.getNewsStatistics();
    return stats[0] || {
      totalNews: 0,
      activeNews: 0,
      totalViews: 0,
      categories: []
    };
  }

  /**
   * Prepare update data
   */
  prepareUpdateData(body, files, currentNews) {
    const updateData = {};

    // Update basic fields
    const fieldsToUpdate = [
      'title', 'description', 'content', 'category', 'author', 'is_active'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = ['title', 'description', 'content', 'author'].includes(field) 
          ? body[field].trim() 
          : body[field];
      }
    });

    // Update slug if title changed
    if (body.title) {
      updateData.slug = generateSlug(body.title);
    }

    // Handle tags array
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) 
        ? body.tags 
        : body.tags.split(',').map(t => t.trim());
    }

    // Handle publish_date
    if (body.publish_date) {
      updateData.publish_date = new Date(body.publish_date);
    }

    // Handle image
    if (files?.image?.[0]) {
      updateData.image = cloudinaryService.uploadFile(files.image[0]);
    }

    return updateData;
  }

  /**
   * Update news
   */
  async updateNews(id, body, files) {
    const currentNews = await this.getNewsById(id);
    
    const updateData = this.prepareUpdateData(body, files, currentNews);
    
    // Delete old image if new one is uploaded
    if (files?.image?.[0] && currentNews.image) {
      await cloudinaryService.deleteImage(currentNews.image);
    }

    return await newsRepository.updateById(id, updateData);
  }

  /**
   * Delete news
   */
  async deleteNews(id) {
    const news = await this.getNewsById(id);

    // Delete image from cloudinary
    if (news.image) {
      await cloudinaryService.deleteImage(news.image);
    }

    await newsRepository.deleteById(id);
    
    return { message: 'Đã xóa tin tức thành công' };
  }
}

export default new NewsService();
