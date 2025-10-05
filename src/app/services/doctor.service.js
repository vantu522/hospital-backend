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
   * Get all doctors with optional filters and pagination
   */
  async getAllDoctors(filters = {}) {
    const {
      specialty,
      hospital,
      is_active,
      page = 1,
      limit = 10,
      search
    } = filters;

    // Build query filters
    const queryFilters = {};
    
    if (specialty) {
      queryFilters.specialties = specialty;
    }

    if (hospital) {
      queryFilters.hospital = { $regex: hospital, $options: 'i' };
    }

    if (is_active !== undefined) {
      queryFilters.is_active = is_active === 'true' || is_active === true;
    }

    // Search functionality
    if (search) {
      queryFilters.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination setup
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Định nghĩa thứ tự ưu tiên dựa trên enum
    const rolePriority = {
      'GIAM_DOC': 1,
      'PHO_GIAM_DOC': 2,
      'TRUONG_PHONG': 3,
      'TRUONG_KHOA': 4,
      'PHO_TRUONG_KHOA': 5,
      'PHO_TRUONG_PHONG': 6,
      'DIEU_DUONG_TRUONG': 7,
      'KHAC': 8
    };

    // Get total count
    const total = await doctorRepository.count(queryFilters);

    // Get paginated doctors
    const doctors = await doctorRepository.find(
      queryFilters,
      {
        populate: { path: 'specialties', select: 'name slug' },
        skip,
        limit: limitNum,
        sort: { createdAt: -1 } // Default sort by creation date
      }
    );

    // Sort by role priority in memory (since MongoDB can't sort by custom priority)
    doctors.sort((a, b) => {
      const roleA = rolePriority[a.role] || 999;
      const roleB = rolePriority[b.role] || 999;
      
      if (roleA !== roleB) {
        return roleA - roleB;
      }
      
      // If same role, sort by name
      return a.full_name.localeCompare(b.full_name);
    });

    const totalPages = Math.ceil(total / limitNum);

    return {
      data: doctors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    };
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
