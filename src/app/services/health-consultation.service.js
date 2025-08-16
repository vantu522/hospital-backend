import healthConsultationRepository from '../repositories/health-consultation.repository.js';
import cloudinaryService from './cloudinary.service.js';
import { generateSlug } from '../../utils/slug.js';

class HealthConsultationService {
  /**
   * Validate health consultation data
   */
  validateCreateData(data, files) {
    const errors = [];
    
    if (!data.title || !data.title.trim()) {
      errors.push('Tiêu đề tư vấn là bắt buộc');
    }

    if (!data.description || !data.description.trim()) {
      errors.push('Mô tả tư vấn là bắt buộc');
    }

    if (!data.specialty_id) {
      errors.push('Chuyên khoa là bắt buộc');
    }

    if (!files?.image?.[0]) {
      errors.push('Ảnh tư vấn là bắt buộc');
    }

    if (data.title && data.title.length > 200) {
      errors.push('Tiêu đề không được vượt quá 200 ký tự');
    }

    if (data.description && data.description.length > 1000) {
      errors.push('Mô tả không được vượt quá 1000 ký tự');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Prepare health consultation data for creation
   */
  prepareCreateData(body, files) {
    return {
      title: body.title.trim(),
      slug: generateSlug(body.title),
      description: body.description.trim(),
      specialty_id: body.specialty_id,
      image: cloudinaryService.uploadFile(files.image[0]),
      is_active: body.is_active !== undefined ? body.is_active : true
    };
  }

  /**
   * Create new health consultation
   */
  async createHealthConsultation(body, files) {
    try {
      this.validateCreateData(body, files);
      
      const consultationData = this.prepareCreateData(body, files);
      const consultation = await healthConsultationRepository.create(consultationData);
      
      return consultation;
    } catch (error) {
      // Delete uploaded image if consultation creation fails
      if (files?.image?.[0]) {
        await cloudinaryService.deleteImage(files.image[0].path);
      }
      throw error;
    }
  }

  /**
   * Get all health consultations with optional filters
   */
  async getAllHealthConsultations(filters = {}) {
    const queryFilters = {};
    
    if (filters.specialty_id) {
      queryFilters.specialty_id = filters.specialty_id;
    }

    if (filters.is_active !== undefined) {
      queryFilters.is_active = filters.is_active;
    }

    const consultations = await healthConsultationRepository.find(queryFilters, {
      populate: { path: 'specialty_id', select: 'name slug' },
      sort: { createdAt: -1 }
    });

    return {
      success: true,
      count: consultations.length,
      data: consultations
    };
  }

  /**
   * Get health consultation by slug
   */
  async getHealthConsultationBySlug(slug) {
    const consultation = await healthConsultationRepository.findBySlug(slug);
    if (!consultation) {
      throw new Error('Không tìm thấy tư vấn sức khỏe');
    }
    return consultation;
  }

  /**
   * Get health consultation by ID
   */
  async getHealthConsultationById(id) {
    const consultation = await healthConsultationRepository.findById(id, 'specialty_id');
    if (!consultation) {
      throw new Error('Không tìm thấy tư vấn sức khỏe');
    }
    return consultation;
  }

  /**
   * Get health consultations by specialty
   */
  async getHealthConsultationsBySpecialty(specialtyId) {
    const consultations = await healthConsultationRepository.findBySpecialty(specialtyId);
    
    if (consultations.length === 0) {
      throw new Error('Không tìm thấy tư vấn nào thuộc chuyên khoa này');
    }

    return {
      count: consultations.length,
      consultations
    };
  }

  /**
   * Get active health consultations
   */
  async getActiveHealthConsultations() {
    return await healthConsultationRepository.findActiveConsultations();
  }

  /**
   * Get latest health consultations
   */
  async getLatestHealthConsultations(limit = 10) {
    return await healthConsultationRepository.findLatestConsultations(limit);
  }

  /**
   * Search health consultations
   */
  async searchHealthConsultations(searchTerm, filters = {}) {
    const queryFilters = { ...filters };
    
    // Default to active consultations unless specified
    if (queryFilters.is_active === undefined) {
      queryFilters.is_active = true;
    }

    return await healthConsultationRepository.searchConsultations(searchTerm, queryFilters);
  }

  /**
   * Get health consultation statistics
   */
  async getHealthConsultationStats() {
    const stats = await healthConsultationRepository.getConsultationStats();
    const result = stats[0];
    
    return {
      total: result.total[0]?.count || 0,
      active: result.active[0]?.count || 0,
      bySpecialty: result.bySpecialty || []
    };
  }

  /**
   * Prepare update data
   */
  prepareUpdateData(body, files) {
    const updateData = {};

    // Update basic fields
    if (body.title !== undefined) {
      updateData.title = body.title.trim();
      updateData.slug = generateSlug(body.title);
    }

    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }

    if (body.specialty_id !== undefined) {
      updateData.specialty_id = body.specialty_id;
    }

    if (body.is_active !== undefined) {
      updateData.is_active = body.is_active;
    }

    // Handle image
    if (files?.image?.[0]) {
      updateData.image = cloudinaryService.uploadFile(files.image[0]);
    }

    return updateData;
  }

  /**
   * Update health consultation
   */
  async updateHealthConsultation(id, body, files) {
    try {
      const currentConsultation = await this.getHealthConsultationById(id);
      
      // Validate if title or description is being updated
      if (body.title && body.title.length > 200) {
        throw new Error('Tiêu đề không được vượt quá 200 ký tự');
      }

      if (body.description && body.description.length > 1000) {
        throw new Error('Mô tả không được vượt quá 1000 ký tự');
      }
      
      const updateData = this.prepareUpdateData(body, files);
      
      // Delete old image if new one is uploaded
      if (files?.image?.[0] && currentConsultation.image) {
        await cloudinaryService.deleteImage(currentConsultation.image);
      }

      const consultation = await healthConsultationRepository.updateById(id, updateData);
      
      return consultation;
    } catch (error) {
      // Delete uploaded image if update fails
      if (files?.image?.[0]) {
        await cloudinaryService.deleteImage(files.image[0].path);
      }
      throw error;
    }
  }

  /**
   * Delete health consultation
   */
  async deleteHealthConsultation(id) {
    const consultation = await this.getHealthConsultationById(id);

    // Delete associated image
    if (consultation.image) {
      await cloudinaryService.deleteImage(consultation.image);
    }

    await healthConsultationRepository.deleteById(id);
    
    return { message: 'Đã xóa tư vấn sức khỏe thành công' };
  }
}

export default new HealthConsultationService();
