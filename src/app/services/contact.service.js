import contactRepository from '../repositories/contact.repository.js';

class ContactService {
  /**
   * Validate contact data
   */
  validateCreateData(data) {
    const errors = [];
    
    if (!data.full_name || !data.full_name.trim()) {
      errors.push('Họ và tên là bắt buộc');
    }

    if (!data.phone_number || !data.phone_number.trim()) {
      errors.push('Số điện thoại là bắt buộc');
    }

    if (!data.email || !data.email.trim()) {
      errors.push('Email là bắt buộc');
    }

    if (!data.message || !data.message.trim()) {
      errors.push('Tin nhắn là bắt buộc');
    }

    // Validate email format
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Email không hợp lệ');
    }

    // Validate phone number format (basic validation)
    if (data.phone_number && !this.isValidPhoneNumber(data.phone_number)) {
      errors.push('Số điện thoại không hợp lệ');
    }

    if (data.full_name && data.full_name.length > 100) {
      errors.push('Họ và tên không được vượt quá 100 ký tự');
    }

    if (data.message && data.message.length > 1000) {
      errors.push('Tin nhắn không được vượt quá 1000 ký tự');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (Vietnamese phone numbers)
   */
  isValidPhoneNumber(phoneNumber) {
    // Basic validation for Vietnamese phone numbers
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phoneNumber.trim());
  }

  /**
   * Prepare contact data for creation
   */
  prepareCreateData(body) {
    return {
      full_name: body.full_name.trim(),
      phone_number: body.phone_number.trim(),
      email: body.email.trim().toLowerCase(),
      message: body.message.trim()
    };
  }

  /**
   * Create new contact
   */
  async createContact(body) {
    try {
      this.validateCreateData(body);
      
      const contactData = this.prepareCreateData(body);
      const contact = await contactRepository.create(contactData);
      
      return contact;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all contacts with optional filters
   */
  async getAllContacts(query = {}) {
    const filters = {};
    
    // Apply filters
    if (query.startDate && query.endDate) {
      return await contactRepository.findByDateRange(query.startDate, query.endDate);
    }
    
    if (query.email) {
      return await contactRepository.findByEmail(query.email);
    }
    
    if (query.phone) {
      return await contactRepository.findByPhone(query.phone);
    }
    
    if (query.search) {
      return await contactRepository.searchContacts(query.search, filters);
    }

    // If no specific filters, return all contacts sorted by latest
    return await contactRepository.find({}, {
      sort: { createdAt: -1 }
    });
  }

  /**
   * Get contact by ID
   */
  async getContactById(id) {
    const contact = await contactRepository.findById(id);
    if (!contact) {
      throw new Error('Không tìm thấy liên hệ');
    }
    return contact;
  }

  /**
   * Get contacts by email
   */
  async getContactsByEmail(email) {
    const contacts = await contactRepository.findByEmail(email);
    
    if (contacts.length === 0) {
      throw new Error('Không tìm thấy liên hệ nào với email này');
    }

    return {
      count: contacts.length,
      contacts
    };
  }

  /**
   * Get contacts by phone number
   */
  async getContactsByPhone(phoneNumber) {
    const contacts = await contactRepository.findByPhone(phoneNumber);
    
    if (contacts.length === 0) {
      throw new Error('Không tìm thấy liên hệ nào với số điện thoại này');
    }

    return {
      count: contacts.length,
      contacts
    };
  }

  /**
   * Get contacts by date range
   */
  async getContactsByDateRange(startDate, endDate) {
    const contacts = await contactRepository.findByDateRange(startDate, endDate);
    
    return {
      count: contacts.length,
      contacts,
      dateRange: {
        startDate,
        endDate
      }
    };
  }

  /**
   * Get latest contacts
   */
  async getLatestContacts(limit = 10) {
    return await contactRepository.findLatestContacts(limit);
  }

  /**
   * Search contacts
   */
  async searchContacts(searchTerm, filters = {}) {
    return await contactRepository.searchContacts(searchTerm, filters);
  }

  /**
   * Get contact statistics
   */
  async getContactStats() {
    return await contactRepository.getContactStats();
  }

  /**
   * Update contact
   */
  async updateContact(id, body) {
    try {
      // Get current contact
      const currentContact = await this.getContactById(id);
      
      // Validate updated data
      if (body.email && !this.isValidEmail(body.email)) {
        throw new Error('Email không hợp lệ');
      }

      if (body.phone_number && !this.isValidPhoneNumber(body.phone_number)) {
        throw new Error('Số điện thoại không hợp lệ');
      }

      if (body.full_name && body.full_name.length > 100) {
        throw new Error('Họ và tên không được vượt quá 100 ký tự');
      }

      if (body.message && body.message.length > 1000) {
        throw new Error('Tin nhắn không được vượt quá 1000 ký tự');
      }
      
      const updateData = {};
      
      // Update fields if provided
      if (body.full_name !== undefined) {
        updateData.full_name = body.full_name.trim();
      }
      
      if (body.phone_number !== undefined) {
        updateData.phone_number = body.phone_number.trim();
      }
      
      if (body.email !== undefined) {
        updateData.email = body.email.trim().toLowerCase();
      }
      
      if (body.message !== undefined) {
        updateData.message = body.message.trim();
      }

      const contact = await contactRepository.updateById(id, updateData);
      
      return contact;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete contact
   */
  async deleteContact(id) {
    await this.getContactById(id); // Check if contact exists

    await contactRepository.deleteById(id);
    
    return { message: 'Đã xóa liên hệ thành công' };
  }

  /**
   * Delete multiple contacts
   */
  async deleteMultipleContacts(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Danh sách ID không hợp lệ');
    }

    const result = await contactRepository.deleteMany({ _id: { $in: ids } });
    
    return { 
      message: `Đã xóa ${result.deletedCount} liên hệ thành công`,
      deletedCount: result.deletedCount
    };
  }
}

export default new ContactService();
