import { body, param, query } from 'express-validator';

// Validation cho tạo cổng khám mới
export const validateCreateCongKham = [
  body('_id')
    .notEmpty()
    .withMessage('ID cổng khám là bắt buộc')
    .isString()
    .withMessage('ID cổng khám phải là chuỗi')
    .isLength({ min: 1, max: 50 })
    .withMessage('ID cổng khám phải có độ dài từ 1-50 ký tự')
    .trim(),

  body('ma_bv')
    .notEmpty()
    .withMessage('Mã bệnh viện là bắt buộc')
    .isString()
    .withMessage('Mã bệnh viện phải là chuỗi')
    .isLength({ min: 1, max: 50 })
    .withMessage('Mã bệnh viện phải có độ dài từ 1-50 ký tự')
    .trim(),

  body('ma_bhyt')
    .notEmpty()
    .withMessage('Mã BHYT là bắt buộc')
    .isString()
    .withMessage('Mã BHYT phải là chuỗi')
    .isLength({ min: 1, max: 50 })
    .withMessage('Mã BHYT phải có độ dài từ 1-50 ký tự')
    .trim(),

  body('ten_bv')
    .notEmpty()
    .withMessage('Tên bệnh viện là bắt buộc')
    .isString()
    .withMessage('Tên bệnh viện phải là chuỗi')
    .isLength({ min: 1, max: 255 })
    .withMessage('Tên bệnh viện phải có độ dài từ 1-255 ký tự')
    .trim(),

  body('ten_bhyt')
    .notEmpty()
    .withMessage('Tên BHYT là bắt buộc')
    .isString()
    .withMessage('Tên BHYT phải là chuỗi')
    .isLength({ min: 1, max: 255 })
    .withMessage('Tên BHYT phải có độ dài từ 1-255 ký tự')
    .trim(),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái hoạt động phải là true/false')
];

// Validation cho cập nhật cổng khám
export const validateUpdateCongKham = [
  body('ma_bv')
    .optional()
    .isString()
    .withMessage('Mã bệnh viện phải là chuỗi')
    .isLength({ min: 1, max: 50 })
    .withMessage('Mã bệnh viện phải có độ dài từ 1-50 ký tự')
    .trim(),

  body('ma_bhyt')
    .optional()
    .isString()
    .withMessage('Mã BHYT phải là chuỗi')
    .isLength({ min: 1, max: 50 })
    .withMessage('Mã BHYT phải có độ dài từ 1-50 ký tự')
    .trim(),

  body('ten_bv')
    .optional()
    .isString()
    .withMessage('Tên bệnh viện phải là chuỗi')
    .isLength({ min: 1, max: 255 })
    .withMessage('Tên bệnh viện phải có độ dài từ 1-255 ký tự')
    .trim(),

  body('ten_bhyt')
    .optional()
    .isString()
    .withMessage('Tên BHYT phải là chuỗi')
    .isLength({ min: 1, max: 255 })
    .withMessage('Tên BHYT phải có độ dài từ 1-255 ký tự')
    .trim(),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái hoạt động phải là true/false')
];

// Validation cho parameter ID
export const validateIdParam = [
  param('id')
    .notEmpty()
    .withMessage('ID không được để trống')
    .isString()
    .withMessage('ID phải là chuỗi')
    .isLength({ min: 1, max: 50 })
    .withMessage('ID phải có độ dài từ 1-50 ký tự')
    .trim()
];

// Validation cho pagination
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Số trang phải là số nguyên dương')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Số lượng phải là số nguyên từ 1-100')
    .toInt(),

  query('sortBy')
    .optional()
    .isString()
    .withMessage('Trường sắp xếp phải là chuỗi')
    .isIn(['_id', 'ma_bv', 'ma_bhyt', 'ten_bv', 'ten_bhyt', 'createdAt', 'updatedAt'])
    .withMessage('Trường sắp xếp không hợp lệ'),

  query('sortOrder')
    .optional()
    .isString()
    .withMessage('Thứ tự sắp xếp phải là chuỗi')
    .isIn(['asc', 'desc'])
    .withMessage('Thứ tự sắp xếp phải là asc hoặc desc')
];
