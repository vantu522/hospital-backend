class ContactValidator {
  static validateCreate(data) {
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

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdate(data) {
    const errors = [];

    // Validate email format if provided
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Email không hợp lệ');
    }

    // Validate phone number format if provided
    if (data.phone_number && !this.isValidPhoneNumber(data.phone_number)) {
      errors.push('Số điện thoại không hợp lệ');
    }

    if (data.full_name && data.full_name.length > 100) {
      errors.push('Họ và tên không được vượt quá 100 ký tự');
    }

    if (data.message && data.message.length > 1000) {
      errors.push('Tin nhắn không được vượt quá 1000 ký tự');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhoneNumber(phoneNumber) {
    // Basic validation for Vietnamese phone numbers
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phoneNumber.trim());
  }
}

export default ContactValidator;
