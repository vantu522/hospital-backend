import serviceRepository from '../repositories/service.repository.js';
import cloudinaryService from './cloudinary.service.js';
import { generateSlug } from '../../utils/slug.js';

class ServiceService {
  /**
   * Validate service data
   */
  validateCreateData(data) {
    const errors = [];
    
    if (!data.name || !data.name.trim()) {
      errors.push('Tên dịch vụ là bắt buộc');
    }

    if (!data.specialties) {
      errors.push('Chuyên khoa là bắt buộc');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Prepare service data for creation
   */
  prepareCreateData(body, files) {
    const { name, specialties, description, features } = body;

    return {
      name: name.trim(),
      specialties,
      description: description || '',
      features: Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : []),
      slug: generateSlug(name),
      avatar: cloudinaryService.uploadFile(files?.avatar?.[0]) || '',
      images: cloudinaryService.uploadFiles(files?.images) || [],
      is_active: true
    };
  }

  /**
   * Create new service
   */
  async createService(body, files) {
    this.validateCreateData(body);
    
    const serviceData = this.prepareCreateData(body, files);
    return await serviceRepository.create(serviceData);
  }

  /**
   * Get all services
   */
  async getAllServices(filters = {}) {
    const queryFilters = {};
    
    if (filters.specialty) {
      queryFilters.specialties = filters.specialty;
    }

    if (filters.is_active !== undefined) {
      queryFilters.is_active = filters.is_active;
    }

    return await serviceRepository.find(queryFilters, {
      populate: { path: 'specialties', select: 'name slug' }
    });
  }

  /**
   * Get service by slug
   */
  async getServiceBySlug(slug) {
    const service = await serviceRepository.findBySlug(slug);
    if (!service) {
      throw new Error('Không tìm thấy dịch vụ');
    }
    return service;
  }

  /**
   * Get service by ID
   */
  async getServiceById(id) {
    const service = await serviceRepository.findById(id, 'specialties');
    if (!service) {
      throw new Error('Không tìm thấy dịch vụ');
    }
    return service;
  }

  /**
   * Get services by specialty
   */
  async getServicesBySpecialty(specialtyId) {
    const services = await serviceRepository.findBySpecialty(specialtyId);
    
    if (services.length === 0) {
      throw new Error('Không tìm thấy dịch vụ nào thuộc chuyên khoa này');
    }

    return {
      count: services.length,
      services
    };
  }

  /**
   * Search services
   */
  async searchServices(searchTerm, filters = {}) {
    return await serviceRepository.searchServices(searchTerm, filters);
  }

  /**
   * Get featured services
   */
  async getFeaturedServices(limit = 6) {
    return await serviceRepository.getFeaturedServices(limit);
  }

  /**
   * Prepare update data
   */
  prepareUpdateData(body, files, currentService) {
    const updateData = {};

    // Update basic fields
    const fieldsToUpdate = ['name', 'specialties', 'description', 'is_active'];
    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = field === 'name' ? body[field].trim() : body[field];
      }
    });

    // Update slug if name changed
    if (body.name) {
      updateData.slug = generateSlug(body.name);
    }

    // Handle features array
    if (body.features !== undefined) {
      updateData.features = Array.isArray(body.features) 
        ? body.features 
        : body.features.split(',').map(f => f.trim());
    }

    // Handle avatar
    if (files?.avatar?.[0]) {
      updateData.avatar = cloudinaryService.uploadFile(files.avatar[0]);
    }

    // Handle images
    if (files?.images && files.images.length > 0) {
      updateData.images = cloudinaryService.uploadFiles(files.images);
    }

    return updateData;
  }

  /**
   * Update service
   */
  async updateService(id, body, files) {
    const currentService = await this.getServiceById(id);
    
    const updateData = this.prepareUpdateData(body, files, currentService);
    
    // Delete old files if new ones are uploaded
    if (files?.avatar?.[0] && currentService.avatar) {
      await cloudinaryService.deleteImage(currentService.avatar);
    }

    if (files?.images && files.images.length > 0 && currentService.images) {
      await cloudinaryService.deleteImages(currentService.images);
    }

    return await serviceRepository.updateById(id, updateData);
  }

  /**
   * Delete service
   */
  async deleteService(id) {
    const service = await this.getServiceById(id);

    // Delete files from cloudinary
    if (service.avatar) {
      await cloudinaryService.deleteImage(service.avatar);
    }
    if (service.images && service.images.length > 0) {
      await cloudinaryService.deleteImages(service.images);
    }

    await serviceRepository.deleteById(id);
    
    return { message: 'Đã xóa dịch vụ thành công' };
  }
}

export default new ServiceService();
