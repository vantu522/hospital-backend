import doctorRepository from '../repositories/doctor.repository.js';
import cloudinaryService from './cloudinary.service.js';
import { generateSlug } from '../../utils/slug.js';

class DoctorService {
  /**
   * Validate doctor data
   */
  validateCreateData(data) {
    const errors = [];
    
    if (!data.full_name || !data.full_name.trim()) {
      errors.push('Tên bác sĩ là bắt buộc');
    }

    if (!data.specialties) {
      errors.push('Chuyên khoa là bắt buộc');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Prepare doctor data for creation
   */
  async prepareCreateData(body, files) {
    const {
      full_name, specialties, hospital, department, degree, description,
      experience, certifications, expertise_fields, training_process,
      phone_number, email, work_address
    } = body;

    return {
      full_name: full_name.trim(),
      specialties,
      hospital: hospital || '',
      department: department || '',
      degree: degree || '',
      description: description || '',
      experience: Array.isArray(experience) ? experience : (experience ? experience.split(',').map(e => e.trim()) : []),
      certifications: Array.isArray(certifications) ? certifications : (certifications ? certifications.split(',').map(c => c.trim()) : []),
      expertise_fields: Array.isArray(expertise_fields) ? expertise_fields : (expertise_fields ? expertise_fields.split(',').map(e => e.trim()) : []),
      training_process: Array.isArray(training_process) ? training_process : (training_process ? training_process.split(',').map(t => t.trim()) : []),
      slug: generateSlug(full_name),
      avatar: files?.avatar?.[0] ? await cloudinaryService.uploadFile(files.avatar[0]) : '',
      phone_number: phone_number || '',
      email: email || '',
      work_address: work_address || '',
      is_active: true
    };
  }

  /**
   * Create new doctor
   */
  async createDoctor(body, files) {
    this.validateCreateData(body);
    const doctorData = await this.prepareCreateData(body, files);
    return await doctorRepository.create(doctorData);
  }

  /**
   * Get all doctors with optional filters
   */
  async getAllDoctors(filters = {}) {
    const queryFilters = {};
    
    if (filters.specialty) {
      queryFilters.specialties = filters.specialty;
    }

    if (filters.is_active !== undefined) {
      queryFilters.is_active = filters.is_active;
    }

    return await doctorRepository.find(queryFilters, {
      populate: { path: 'specialties', select: 'name slug' }
    });
  }

  /**
   * Get doctor by slug
   */
  async getDoctorBySlug(slug) {
    const doctor = await doctorRepository.findBySlug(slug);
    if (!doctor) {
      throw new Error('Không tìm thấy bác sĩ');
    }
    return doctor;
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(id) {
    const doctor = await doctorRepository.findById(id, 'specialties');
    if (!doctor) {
      throw new Error('Không tìm thấy bác sĩ');
    }
    return doctor;
  }

  /**
   * Get doctors by specialty
   */
  async getDoctorsBySpecialty(specialtyId) {
    const doctors = await doctorRepository.findBySpecialty(specialtyId);
    
    if (doctors.length === 0) {
      throw new Error('Không tìm thấy bác sĩ nào thuộc chuyên khoa này');
    }

    return {
      count: doctors.length,
      doctors
    };
  }

  /**
   * Get random doctors
   */
  async getFiveRandomDoctors() {
    return await doctorRepository.findFiveRandomDoctors();
  }

  /**
   * Search doctors
   */
  async searchDoctors(searchTerm, filters = {}) {
    return await doctorRepository.searchDoctors(searchTerm, filters);
  }

  /**
   * Prepare update data
   */
  async prepareUpdateData(body, files, currentDoctor) {
    const updateData = {};

    // Update basic fields
    const fieldsToUpdate = [
      'full_name', 'specialties', 'hospital', 'department', 'degree', 
      'description', 'phone_number', 'email', 'work_address', 'is_active'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = field === 'full_name' ? body[field].trim() : body[field];
      }
    });

    // Update slug if name changed
    if (body.full_name) {
      updateData.slug = generateSlug(body.full_name);
    }

    // Handle arrays
    const arrayFields = ['experience', 'certifications', 'expertise_fields', 'training_process'];
    arrayFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = Array.isArray(body[field]) 
          ? body[field] 
          : body[field].split(',').map(item => item.trim());
      }
    });

    // Handle avatar
    if (files?.avatar?.[0]) {
      updateData.avatar = await cloudinaryService.uploadFile(files.avatar[0]);
    }

    return updateData;
  }

  /**
   * Update doctor
   */
  async updateDoctor(id, body, files) {
    const currentDoctor = await this.getDoctorById(id);
    const updateData = await this.prepareUpdateData(body, files, currentDoctor);
    // Delete old avatar if new one is uploaded
    if (files?.avatar?.[0] && currentDoctor.avatar) {
      await cloudinaryService.deleteImage(currentDoctor.avatar);
    }
    return await doctorRepository.updateById(id, updateData);
  }

  /**
   * Delete doctor
   */
  async deleteDoctor(id) {
    const doctor = await this.getDoctorById(id);

    // Delete avatar from cloudinary
    if (doctor.avatar) {
      await cloudinaryService.deleteImage(doctor.avatar);
    }

    await doctorRepository.deleteById(id);
    
    return { message: 'Đã xóa bác sĩ thành công' };
  }
}

export default new DoctorService();
