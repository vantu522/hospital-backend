import informationRepository from '../repositories/information.repository.js';

class InformationService {
  /**
   * Validate information data
   */
  validateInformationData(data) {
    const errors = [];
    
    if (!data.name || !data.name.trim()) {
      errors.push('Tên bệnh viện/cơ sở y tế là bắt buộc');
    }

    if (data.name && data.name.length > 200) {
      errors.push('Tên không được vượt quá 200 ký tự');
    }

    if (data.address && data.address.length > 500) {
      errors.push('Địa chỉ không được vượt quá 500 ký tự');
    }

    // Validate contact information using repository method
    const contactErrors = informationRepository.validateContactInfo(data);
    if (contactErrors && Array.isArray(contactErrors)) {
      for (let i = 0; i < contactErrors.length; i++) {
        errors.push(contactErrors[i]);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Prepare information data
   */
  prepareInformationData(body) {
    const data = {};
    
    if (body.name !== undefined) {
      data.name = body.name.trim();
    }
    
    if (body.address !== undefined) {
      data.address = body.address.trim();
    }
    
    if (body.phone_number !== undefined) {
      data.phone_number = body.phone_number.trim();
    }
    
    if (body.email !== undefined) {
      data.email = body.email.trim().toLowerCase();
    }
    
    if (body.hotline !== undefined) {
      data.hotline = body.hotline.trim();
    }
    
    if (body.emergency_phone !== undefined) {
      data.emergency_phone = body.emergency_phone.trim();
    }
    
    // Handle work_hours array
    if (body.work_hours !== undefined) {
      if (Array.isArray(body.work_hours)) {
        const cleanHours = [];
        for (let i = 0; i < body.work_hours.length; i++) {
          const trimmed = body.work_hours[i] ? body.work_hours[i].trim() : '';
          if (trimmed) {
            cleanHours.push(trimmed);
          }
        }
        data.work_hours = cleanHours;
      } else if (typeof body.work_hours === 'string') {
        const parts = body.work_hours.split(',');
        const cleanHours = [];
        for (let i = 0; i < parts.length; i++) {
          const trimmed = parts[i].trim();
          if (trimmed) {
            cleanHours.push(trimmed);
          }
        }
        data.work_hours = cleanHours;
      }
    }
    
    // Handle license array
    if (body.license !== undefined) {
      if (Array.isArray(body.license)) {
        const cleanLicenses = [];
        for (let i = 0; i < body.license.length; i++) {
          const trimmed = body.license[i] ? body.license[i].trim() : '';
          if (trimmed) {
            cleanLicenses.push(trimmed);
          }
        }
        data.license = cleanLicenses;
      } else if (typeof body.license === 'string') {
        const parts = body.license.split(',');
        const cleanLicenses = [];
        for (let i = 0; i < parts.length; i++) {
          const trimmed = parts[i].trim();
          if (trimmed) {
            cleanLicenses.push(trimmed);
          }
        }
        data.license = cleanLicenses;
      }
    }

    return data;
  }

  /**
   * Create or update information
   */
  async createOrUpdateInformation(body) {
    try {
      const informationData = this.prepareInformationData(body);
      this.validateInformationData(informationData);
      
      const information = await informationRepository.updateMainInformation(informationData);
      
      return information;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get main information
   */
  async getMainInformation() {
    const information = await informationRepository.getMainInformation();
    
    if (!information) {
      // Return default structure if no information exists
      return {
        name: '',
        address: '',
        phone_number: '',
        email: '',
        hotline: '',
        emergency_phone: '',
        work_hours: [],
        license: []
      };
    }
    
    return information;
  }

  /**
   * Get all information records
   */
  async getAllInformation() {
    return await informationRepository.find({}, {
      sort: { createdAt: -1 }
    });
  }

  /**
   * Get information by ID
   */
  async getInformationById(id) {
    const information = await informationRepository.findById(id);
    if (!information) {
      throw new Error('Không tìm thấy thông tin');
    }
    return information;
  }

  /**
   * Update information by ID
   */
  async updateInformation(id, body) {
    try {
      // Check if information exists
      await this.getInformationById(id);
      
      const updateData = this.prepareInformationData(body);
      this.validateInformationData(updateData);
      
      const information = await informationRepository.updateById(id, updateData);
      
      return information;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete information by ID
   */
  async deleteInformation(id) {
    await this.getInformationById(id); // Check if exists

    await informationRepository.deleteById(id);
    
    return { message: 'Đã xóa thông tin thành công' };
  }

  /**
   * Search information
   */
  async searchInformation(searchTerm) {
    return await informationRepository.searchInformation(searchTerm);
  }

  /**
   * Get information statistics
   */
  async getInformationStats() {
    const stats = await informationRepository.getInformationStats();
    const result = stats[0];
    
    return {
      total: result.total[0]?.count || 0,
      withPhone: result.withPhone[0]?.count || 0,
      withEmail: result.withEmail[0]?.count || 0,
      withHotline: result.withHotline[0]?.count || 0,
      withEmergency: result.withEmergency[0]?.count || 0
    };
  }

  /**
   * Get contact methods summary
   */
  async getContactMethodsSummary() {
    return await informationRepository.getContactMethodsSummary();
  }

  /**
   * Get public information (for frontend display)
   */
  async getPublicInformation() {
    const information = await this.getMainInformation();
    
    // Return only public fields
    return {
      name: information.name || '',
      address: information.address || '',
      phone_number: information.phone_number || '',
      email: information.email || '',
      hotline: information.hotline || '',
      emergency_phone: information.emergency_phone || '',
      work_hours: information.work_hours || []
    };
  }

}

export default new InformationService();
