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
    if (data.role && !['superadmin', 'admin', 'receptionist'].includes(data.role)) {
      errors.push('Vai trò không hợp lệ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCreatePermissions(creatorRole, targetRole) {
    const errors = [];

    // Only superadmin can create other superadmin and admin accounts
    if (targetRole === 'superadmin' || targetRole === 'admin') {
      if (creatorRole !== 'superadmin') {
        errors.push('Chỉ superadmin mới có thể tạo tài khoản superadmin hoặc admin');
      }
    }

    // Admin can create receptionist accounts
    if (targetRole === 'receptionist') {
      if (creatorRole !== 'superadmin' && creatorRole !== 'admin') {
        errors.push('Chỉ admin hoặc superadmin mới có thể tạo tài khoản lễ tân');
      }
    }

    // Validate target role
    const validRoles = ['superadmin', 'admin', 'receptionist'];
    if (!validRoles.includes(targetRole)) {
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
    if (data.role && !['superadmin', 'admin', 'receptionist'].includes(data.role)) {
      errors.push('Vai trò không hợp lệ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdatePermissions(updaterRole, targetRole, newRole) {
    const errors = [];

    // Only superadmin can update to superadmin or admin roles
    if (newRole === 'superadmin' || newRole === 'admin') {
      if (updaterRole !== 'superadmin') {
        errors.push('Chỉ superadmin mới có thể cập nhật thành superadmin hoặc admin');
      }
    }

    // Admin can update to receptionist role
    if (newRole === 'receptionist') {
      if (updaterRole !== 'superadmin' && updaterRole !== 'admin') {
        errors.push('Chỉ admin hoặc superadmin mới có thể cập nhật thành lễ tân');
      }
    }

    // Prevent non-superadmin from updating superadmin accounts
    if (targetRole === 'superadmin' && updaterRole !== 'superadmin') {
      errors.push('Chỉ superadmin mới có thể cập nhật tài khoản superadmin');
    }

    // Validate new role
    const validRoles = ['superadmin', 'admin', 'receptionist'];
    if (newRole && !validRoles.includes(newRole)) {
      errors.push('Vai trò không hợp lệ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateDeletePermissions(deleterRole, targetRole) {
    const errors = [];

    // Only superadmin can delete other superadmin accounts
    if (targetRole === 'superadmin' && deleterRole !== 'superadmin') {
      errors.push('Chỉ superadmin mới có thể xóa tài khoản superadmin');
    }

    // Only superadmin can delete admin accounts
    if (targetRole === 'admin' && deleterRole !== 'superadmin') {
      errors.push('Chỉ superadmin mới có thể xóa tài khoản admin');
    }

    // Admin and superadmin can delete receptionist accounts
    if (targetRole === 'receptionist') {
      if (deleterRole !== 'superadmin' && deleterRole !== 'admin') {
        errors.push('Chỉ admin hoặc superadmin mới có thể xóa tài khoản lễ tân');
      }
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
