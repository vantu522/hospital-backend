import specialtyRepository from '../repositories/specialty.repository.js';
import cloudinaryService from './cloudinary.service.js';
import { generateSlug } from '../../utils/slug.js';

class SpecialtyService {
  /**
   * Validate specialty data
   */
  validateCreateData(data) {
    const errors = [];
    
    if (!data.name || !data.name.trim()) {
      errors.push('Tên chuyên khoa là bắt buộc');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Prepare specialty data for creation
   */
  async prepareCreateData(body, files) {
    const { name, description, functions } = body;

    return {
      name: name.trim(),
      description: description ? description.trim() : '',
      functions: Array.isArray(functions) 
        ? functions 
        : (functions ? functions.split(',').map(f => f.trim()) : []),
      slug: generateSlug(name),
      images: files?.images ? await cloudinaryService.uploadFiles(files.images) : [],
      is_active: true
    };
  }

  /**
   * Create new specialty
   */
  async createSpecialty(body, files) {
    this.validateCreateData(body);
    const specialtyData = await this.prepareCreateData(body, files);
    return await specialtyRepository.create(specialtyData);
  }

  /**
   * Get all specialties
   */
  async getAllSpecialties(onlyActive = false) {
    const conditions = onlyActive ? { is_active: true } : {};
    return await specialtyRepository.find(conditions, {
      select: 'name description functions images slug is_active',
      sort: { name: 1 }
    });
  }

  /**
   * Get specialty by slug
   */
  async getSpecialtyBySlug(slug) {
    const specialty = await specialtyRepository.findBySlug(slug);
    if (!specialty) {
      throw new Error('Không tìm thấy chuyên khoa');
    }
    return specialty;
  }

  /**
   * Get specialty by ID
   */
  async getSpecialtyById(id) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) {
      throw new Error('Không tìm thấy chuyên khoa');
    }
    return specialty;
  }

  /**
   * Get specialty with doctors
   */
  async getSpecialtyWithDoctors(id) {
    const specialty = await this.getSpecialtyById(id);
    
    // Import Doctor model dynamically để tránh circular dependency
    const { default: Doctor } = await import('../../models/doctor.model.js');
    const doctors = await Doctor.find({ specialties: id })
      .select('full_name slug avatar');

    return {
      specialty,
      doctors,
      doctorCount: doctors.length
    };
  }

  /**
   * Prepare update data
   */
  async prepareUpdateData(body, files, currentSpecialty) {
    const updateData = {};

    if (body.name !== undefined) {
      updateData.name = body.name.trim();
      updateData.slug = generateSlug(body.name);
    }

    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }

    if (body.functions !== undefined) {
      updateData.functions = Array.isArray(body.functions) 
        ? body.functions 
        : body.functions.split(',').map(f => f.trim());
    }

    if (body.is_active !== undefined) {
      updateData.is_active = body.is_active;
    }

    // Handle image updates
    if (files?.images && files.images.length > 0) {
      updateData.images = await cloudinaryService.uploadFiles(files.images);
    }

    return updateData;
  }

  /**
   * Update specialty
   */
  async updateSpecialty(id, body, files) {
    const currentSpecialty = await this.getSpecialtyById(id);
    const updateData = await this.prepareUpdateData(body, files, currentSpecialty);
    // Nếu có ảnh mới, xóa ảnh cũ
    if (files?.images && files.images.length > 0) {
      await cloudinaryService.deleteImages(currentSpecialty.images);
    }
    return await specialtyRepository.updateById(id, updateData);
  }

  /**
   * Delete specialty
   */
  async deleteSpecialty(id) {
    const specialty = await this.getSpecialtyById(id);

    // Kiểm tra xem specialty có đang được sử dụng không
    const usageCheck = await specialtyRepository.checkSpecialtyInUse(id);
    if (usageCheck.inUse) {
      throw new Error(
        `Không thể xóa chuyên khoa này vì đang được sử dụng bởi: ` +
        `${usageCheck.details.doctors} bác sĩ, ` +
        `${usageCheck.details.services} dịch vụ, ` +
        `${usageCheck.details.consultations} tư vấn sức khỏe`
      );
    }

    // Xóa ảnh trên Cloudinary
    await cloudinaryService.deleteImages(specialty.images);

    // Xóa specialty
    await specialtyRepository.deleteById(id);
    
    return { message: 'Xóa chuyên khoa thành công' };
  }
}

export default new SpecialtyService();
