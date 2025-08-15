
import SpecialtyValidator from './specialty.validator.js';
import ContactValidator from './contact.validator.js';
import UserValidator from './user.validator.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // lấy tất cả lỗi
      allowUnknown: true, // cho phép field không có trong schema
      stripUnknown: true, // loại bỏ field không khai báo
    });

    if (error) {
      const details = error.details.map((err) => err.message);
      return res.status(400).json({
        status: "error",
        message: "Dữ liệu không hợp lệ",
        errors: details,
      });
    }

    req.body = value; // gán lại body đã được lọc
    next();
  };
};

// Specialty validators
export const validateSpecialtyCreate = (req, res, next) => {
  const validation = SpecialtyValidator.validateCreate(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      status: "error",
      message: "Dữ liệu không hợp lệ",
      errors: validation.errors,
    });
  }
  
  next();
};

export const validateSpecialtyUpdate = (req, res, next) => {
  const validation = SpecialtyValidator.validateUpdate(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      status: "error", 
      message: "Dữ liệu không hợp lệ",
      errors: validation.errors,
    });
  }
  
  next();
};

// Contact validators
export const validateContactCreate = (req, res, next) => {
  const validation = ContactValidator.validateCreate(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      status: "error",
      message: "Dữ liệu không hợp lệ",
      errors: validation.errors,
    });
  }
  
  next();
};

export const validateContactUpdate = (req, res, next) => {
  const validation = ContactValidator.validateUpdate(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      status: "error",
      message: "Dữ liệu không hợp lệ", 
      errors: validation.errors,
    });
  }
  
  next();
};

// User validators
export const validateUserCreate = (req, res, next) => {
  const validation = UserValidator.validateCreate(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      status: "error",
      message: "Dữ liệu không hợp lệ",
      errors: validation.errors,
    });
  }
  
  next();
};

export const validateUserLogin = (req, res, next) => {
  const validation = UserValidator.validateLogin(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      status: "error",
      message: "Dữ liệu không hợp lệ",
      errors: validation.errors,
    });
  }
  
  next();
};

export const validateUserUpdate = (req, res, next) => {
  const validation = UserValidator.validateUpdate(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      status: "error",
      message: "Dữ liệu không hợp lệ",
      errors: validation.errors,
    });
  }
  
  next();
};
