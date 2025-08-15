import recruitmentRepository from '../repositories/recruitment.repository.js';
import fileService from './file.service.js';
import cloudinaryService from './cloudinary.service.js';
import { generateSlug } from '../../utils/slug.js';

class RecruitmentService {
  /**
   * Validate recruitment data
   */
  validateCreateData(data) {
    const errors = [];
    
    if (!data.title || !data.title.trim()) {
      errors.push('Tiêu đề tuyển dụng là bắt buộc');
    }

    if (!data.expiry_date) {
      errors.push('Ngày hết hạn là bắt buộc');
    }

    // Check if expiry date is in the future
    if (data.expiry_date && new Date(data.expiry_date) <= new Date()) {
      errors.push('Ngày hết hạn phải lớn hơn ngày hiện tại');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Prepare recruitment data for creation
   */
  prepareCreateData(body, file) {
    return {
      title: body.title.trim(),
      slug: generateSlug(body.title),
      position: body.position || '',
      description: body.description || '',
      requirements: Array.isArray(body.requirements) 
        ? body.requirements 
        : (body.requirements ? body.requirements.split(',').map(r => r.trim()) : []),
      benefits: Array.isArray(body.benefits) 
        ? body.benefits 
        : (body.benefits ? body.benefits.split(',').map(b => b.trim()) : []),
      location: body.location || '',
      contact_email: body.contact_email || '',
      recruitment_count: parseInt(body.recruitment_count) || 1,
      expiry_date: new Date(body.expiry_date),
      document: fileService.saveFile(file),
      deadline: body.deadline ? new Date(body.deadline) : null,
      specialty_id: body.specialty_id || null
    };
  }

  /**
   * Create new recruitment
   */
  async createRecruitment(body, file) {
    try {
      this.validateCreateData(body);
      
      const recruitmentData = this.prepareCreateData(body, file);
      const recruitment = await recruitmentRepository.create(recruitmentData);
      
      return recruitment;
    } catch (error) {
      // Delete uploaded file if recruitment creation fails
      if (file) {
        await fileService.deleteFile(file.filename);
      }
      throw error;
    }
  }

  /**
   * Get all recruitments with optional filters
   */
  async getAllRecruitments(filters = {}) {
    const queryFilters = {};
    
    if (filters.active === 'true') {
      queryFilters.expiry_date = { $gte: new Date() };
    } else if (filters.active === 'false') {
      queryFilters.expiry_date = { $lt: new Date() };
    }

    if (filters.specialty_id) {
      queryFilters.specialty_id = filters.specialty_id;
    }

    return await recruitmentRepository.find(queryFilters, {
      sort: { createdAt: -1 }
    });
  }

  /**
   * Get recruitment by slug
   */
  async getRecruitmentBySlug(slug) {
    const recruitment = await recruitmentRepository.findBySlug(slug);
    if (!recruitment) {
      throw new Error('Không tìm thấy tin tuyển dụng');
    }
    return recruitment;
  }

  /**
   * Get recruitment by ID
   */
  async getRecruitmentById(id) {
    const recruitment = await recruitmentRepository.findById(id);
    if (!recruitment) {
      throw new Error('Không tìm thấy tin tuyển dụng');
    }
    return recruitment;
  }

  /**
   * Get active recruitments
   */
  async getActiveRecruitments() {
    return await recruitmentRepository.findActiveRecruitments();
  }

  /**
   * Get latest recruitments
   */
  async getLatestRecruitments(limit = 10) {
    return await recruitmentRepository.findLatestRecruitments(limit);
  }

  /**
   * Search recruitments
   */
  async searchRecruitments(searchTerm, filters = {}) {
    return await recruitmentRepository.searchRecruitments(searchTerm, filters);
  }

  /**
   * Get recruitment statistics
   */
  async getRecruitmentStats() {
    const stats = await recruitmentRepository.getRecruitmentStats();
    const result = stats[0];
    
    return {
      total: result.total[0]?.count || 0,
      active: result.active[0]?.count || 0,
      expired: result.expired[0]?.count || 0
    };
  }

  /**
   * Prepare update data
   */
  prepareUpdateData(body, file) {
    const updateData = {};

    // Update basic fields
    const fieldsToUpdate = [
      'title', 'position', 'description', 'location', 'contact_email', 
      'recruitment_count', 'expiry_date', 'deadline', 'specialty_id'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'title') {
          updateData[field] = body[field].trim();
          updateData.slug = generateSlug(body[field]);
        } else if (field === 'recruitment_count') {
          updateData[field] = parseInt(body[field]) || 1;
        } else if (['expiry_date', 'deadline'].includes(field)) {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Handle arrays
    if (body.requirements !== undefined) {
      updateData.requirements = Array.isArray(body.requirements) 
        ? body.requirements 
        : body.requirements.split(',').map(r => r.trim());
    }

    if (body.benefits !== undefined) {
      updateData.benefits = Array.isArray(body.benefits) 
        ? body.benefits 
        : body.benefits.split(',').map(b => b.trim());
    }

    // Handle document
    if (file) {
      updateData.document = fileService.saveFile(file);
    }

    return updateData;
  }

  /**
   * Update recruitment
   */
  async updateRecruitment(id, body, file) {
    try {
      const currentRecruitment = await this.getRecruitmentById(id);
      
      // Validate expiry date if provided
      if (body.expiry_date && new Date(body.expiry_date) <= new Date()) {
        throw new Error('Ngày hết hạn phải lớn hơn ngày hiện tại');
      }
      
      const updateData = this.prepareUpdateData(body, file);
      
      // Replace old document if new one is uploaded
      if (file && currentRecruitment.document) {
        await fileService.deleteFile(currentRecruitment.document);
      }

      const recruitment = await recruitmentRepository.updateById(id, updateData);
      
      return recruitment;
    } catch (error) {
      // Delete uploaded file if update fails
      if (file) {
        await fileService.deleteFile(file.filename);
      }
      throw error;
    }
  }

  /**
   * Delete recruitment
   */
  async deleteRecruitment(id) {
    const recruitment = await this.getRecruitmentById(id);

    // Delete associated document file
    if (recruitment.document) {
      await fileService.deleteFile(recruitment.document);
    }

    await recruitmentRepository.deleteById(id);
    
    return { message: 'Đã xóa tin tuyển dụng thành công' };
  }

  /**
   * Download recruitment document
   */
  async downloadDocument(id) {
    const recruitment = await this.getRecruitmentById(id);

    if (!recruitment.document) {
      throw new Error('Không tìm thấy file tài liệu');
    }

    const downloadInfo = fileService.getDownloadInfo(
      recruitment.document,
      recruitment.title,
      recruitment._id
    );

    if (!downloadInfo.exists) {
      throw new Error('File tài liệu không tồn tại trên server');
    }

    return {
      filePath: downloadInfo.filePath,
      fileName: downloadInfo.downloadName,
      stream: fileService.createReadStream(downloadInfo.filePath)
    };
  }
}

export default new RecruitmentService();
