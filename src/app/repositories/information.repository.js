import BaseRepository from './base.repository.js';
import Information from '../../models/information.js';

class InformationRepository extends BaseRepository {
  constructor() {
    super(Information);
  }

  /**
   * Get the main information (there should typically be only one record)
   */
  async getMainInformation() {
    return await this.model.findOne().sort({ createdAt: -1 });
  }

  /**
   * Update main information (create if doesn't exist)
   */
  async updateMainInformation(data) {
    const existingInfo = await this.getMainInformation();
    
    if (existingInfo) {
      return await this.updateById(existingInfo._id, data);
    } else {
      return await this.create(data);
    }
  }

  /**
   * Search information by fields
   */
  async searchInformation(searchTerm) {
    const query = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } },
        { phone_number: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { hotline: { $regex: searchTerm, $options: 'i' } },
        { emergency_phone: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    return await this.model.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get information statistics
   */
  async getInformationStats() {
    return await this.model.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          withPhone: [
            { $match: { phone_number: { $exists: true, $ne: "" } } },
            { $count: "count" }
          ],
          withEmail: [
            { $match: { email: { $exists: true, $ne: "" } } },
            { $count: "count" }
          ],
          withHotline: [
            { $match: { hotline: { $exists: true, $ne: "" } } },
            { $count: "count" }
          ],
          withEmergency: [
            { $match: { emergency_phone: { $exists: true, $ne: "" } } },
            { $count: "count" }
          ]
        }
      }
    ]);
  }

  /**
   * Validate contact information
   */
  async validateContactInfo(data) {
    const errors = [];
    
    // Check if phone numbers are valid
    if (data.phone_number && !this.isValidPhoneNumber(data.phone_number)) {
      errors.push('Số điện thoại không hợp lệ');
    }
    
    if (data.hotline && !this.isValidPhoneNumber(data.hotline)) {
      errors.push('Số hotline không hợp lệ');
    }
    
    if (data.emergency_phone && !this.isValidPhoneNumber(data.emergency_phone)) {
      errors.push('Số điện thoại khẩn cấp không hợp lệ');
    }
    
    // Check if email is valid
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Email không hợp lệ');
    }
    
    return errors;
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phoneNumber.trim());
  }

  /**
   * Get contact methods summary
   */
  async getContactMethodsSummary() {
    const info = await this.getMainInformation();
    
    if (!info) {
      return {
        hasPhone: false,
        hasEmail: false,
        hasHotline: false,
        hasEmergency: false,
        contactMethods: []
      };
    }

    const contactMethods = [];
    
    if (info.phone_number) contactMethods.push({ type: 'phone', value: info.phone_number });
    if (info.email) contactMethods.push({ type: 'email', value: info.email });
    if (info.hotline) contactMethods.push({ type: 'hotline', value: info.hotline });
    if (info.emergency_phone) contactMethods.push({ type: 'emergency', value: info.emergency_phone });

    return {
      hasPhone: !!info.phone_number,
      hasEmail: !!info.email,
      hasHotline: !!info.hotline,
      hasEmergency: !!info.emergency_phone,
      contactMethods
    };
  }
}

export default new InformationRepository();
