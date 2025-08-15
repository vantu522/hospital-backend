class UserValidator {
  static validateCreate(data) {
    const errors = [];

    if (!data.name || !data.name.trim()) {
      errors.push('Tên là bắt buộc');
    }

    if (!data.email || !data.email.trim()) {
      errors.push('Email là bắt buộc');
    }

    if (!data.password || !data.password.trim()) {
      errors.push('Mật khẩu là bắt buộc');
    }

    // Validate email format
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Email không hợp lệ');
    }

    // Validate password strength
    if (data.password && data.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Tên không được vượt quá 100 ký tự');
    }

    // Validate role if provided
    if (data.role && !['admin', 'doctor', 'user'].includes(data.role)) {
      errors.push('Vai trò không hợp lệ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateLogin(data) {
    const errors = [];

    if (!data.email || !data.email.trim()) {
      errors.push('Email là bắt buộc');
    }

    if (!data.password || !data.password.trim()) {
      errors.push('Mật khẩu là bắt buộc');
    }

    // Validate email format
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Email không hợp lệ');
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

    // Validate password strength if provided
    if (data.password && data.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Tên không được vượt quá 100 ký tự');
    }

    // Validate role if provided
    if (data.role && !['admin', 'doctor', 'user'].includes(data.role)) {
      errors.push('Vai trò không hợp lệ');
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
}

export default UserValidator;
