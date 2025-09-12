import { body, param, query, validationResult } from 'express-validator';

// Middleware để check validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dữ liệu không hợp lệ',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation cho tạo loại khám
export const validateCreateLoaiKham = [
  body('_id')
    .notEmpty()
    .withMessage('ID loại khám không được để trống')
    .isLength({ min: 1, max: 50 })
    .withMessage('ID loại khám phải từ 1-50 ký tự')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('ID chỉ được chứa chữ, số, dấu gạch dưới và gạch ngang'),
    
  body('ma')
    .notEmpty()
    .withMessage('Mã loại khám không được để trống')
    .isLength({ min: 1, max: 20 })
    .withMessage('Mã loại khám phải từ 1-20 ký tự')
    .matches(/^[A-Z0-9_-]+$/i)
    .withMessage('Mã chỉ được chứa chữ, số, dấu gạch dưới và gạch ngang'),
    
  body('ten')
    .notEmpty()
    .withMessage('Tên loại khám không được để trống')
    .isLength({ min: 1, max: 255 })
    .withMessage('Tên loại khám phải từ 1-255 ký tự')
    .trim(),

  handleValidationErrors
];

// Validation cho cập nhật loại khám
export const validateUpdateLoaiKham = [
  param('id')
    .notEmpty()
    .withMessage('ID không được để trống'),
    
  body('ma')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Mã loại khám phải từ 1-20 ký tự')
    .matches(/^[A-Z0-9_-]+$/i)
    .withMessage('Mã chỉ được chứa chữ, số, dấu gạch dưới và gạch ngang'),
    
  body('ten')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Tên loại khám phải từ 1-255 ký tự')
    .trim(),
    
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active phải là true hoặc false'),

  handleValidationErrors
];

// Validation cho ID params
export const validateIdParam = [
  param('id')
    .notEmpty()
    .withMessage('ID không được để trống'),
    
  handleValidationErrors
];

// Validation cho query pagination
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit phải là số từ 1-100'),
    
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_active phải là true hoặc false'),

  handleValidationErrors
];

