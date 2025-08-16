class SpecialtyValidator {
  static validateCreate(data) {
    const errors = [];

    if (!data.name || !data.name.trim()) {
      errors.push('Tên chuyên khoa là bắt buộc');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Tên chuyên khoa không được vượt quá 100 ký tự');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Mô tả không được vượt quá 500 ký tự');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdate(data) {
    const errors = [];

    if (data.name !== undefined && (!data.name || !data.name.trim())) {
      errors.push('Tên chuyên khoa không được để trống');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Tên chuyên khoa không được vượt quá 100 ký tự');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Mô tả không được vượt quá 500 ký tự');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default SpecialtyValidator;
