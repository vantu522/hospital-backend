import { body, param, query } from 'express-validator';

// Validation cho tạo khoa khám mới
export const validateCreateKhoaKham = [
  body('_id')
    .notEmpty()
    .withMessage('ID khoa khám là bắt buộc')
    .isString()
    .withMessage('ID khoa khám phải là chuỗi')
    .isLength({ min: 1, max: 50 })
    .withMessage('ID khoa khám phải có độ dài từ 1-50 ký tự')
    .trim(),

  body('ma')
    .notEmpty()
    .withMessage('Mã khoa khám là bắt buộc')
    .isString()
    .withMessage('Mã khoa khám phải là chuỗi')
    .isLength({ min: 1, max: 20 })
    .withMessage('Mã khoa khám phải có độ dài từ 1-20 ký tự')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Mã khoa khám chỉ được chứa chữ cái in hoa và số')
    .trim(),

  body('ten')
    .notEmpty()
    .withMessage('Tên khoa khám là bắt buộc')
    .isString()
    .withMessage('Tên khoa khám phải là chuỗi')
    .isLength({ min: 1, max: 255 })
    .withMessage('Tên khoa khám phải có độ dài từ 1-255 ký tự')
    .trim(),

  body('dia_chi')
    .notEmpty()
    .withMessage('Địa chỉ là bắt buộc')
    .isString()
    .withMessage('Địa chỉ phải là chuỗi')
    .isLength({ min: 1, max: 500 })
    .withMessage('Địa chỉ phải có độ dài từ 1-500 ký tự')
    .trim(),

  body('cap_quan_li')
    .notEmpty()
    .withMessage('Cấp quản lí là bắt buộc')
    .isString()
    .withMessage('Cấp quản lí phải là chuỗi')
    .isLength({ min: 1, max: 100 })
    .withMessage('Cấp quản lí phải có độ dài từ 1-100 ký tự')
    .trim(),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái hoạt động phải là true/false')
];

// Validation cho cập nhật khoa khám
export const validateUpdateKhoaKham = [
  body('ma')
    .optional()
    .isString()
    .withMessage('Mã khoa khám phải là chuỗi')
    .isLength({ min: 1, max: 20 })
    .withMessage('Mã khoa khám phải có độ dài từ 1-20 ký tự')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Mã khoa khám chỉ được chứa chữ cái in hoa và số')
    .trim(),

  body('ten')
    .optional()
    .isString()
    .withMessage('Tên khoa khám phải là chuỗi')
    .isLength({ min: 1, max: 255 })
    .withMessage('Tên khoa khám phải có độ dài từ 1-255 ký tự')
    .trim(),

  body('dia_chi')
    .optional()
    .isString()
    .withMessage('Địa chỉ phải là chuỗi')
    .isLength({ min: 1, max: 500 })
    .withMessage('Địa chỉ phải có độ dài từ 1-500 ký tự')
    .trim(),

  body('cap_quan_li')
    .optional()
    .isString()
    .withMessage('Cấp quản lí phải là chuỗi')
    .isLength({ min: 1, max: 100 })
    .withMessage('Cấp quản lí phải có độ dài từ 1-100 ký tự')
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

// Validation cho parameter cấp quản lí
export const validateCapQuanLiParam = [
  param('capQuanLi')
    .notEmpty()
    .withMessage('Cấp quản lí không được để trống')
    .isString()
    .withMessage('Cấp quản lí phải là chuỗi')
    .isLength({ min: 1, max: 100 })
    .withMessage('Cấp quản lí phải có độ dài từ 1-100 ký tự')
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
    .isIn(['_id', 'ma', 'ten', 'dia_chi', 'cap_quan_li', 'createdAt', 'updatedAt'])
    .withMessage('Trường sắp xếp không hợp lệ'),

  query('sortOrder')
    .optional()
    .isString()
    .withMessage('Thứ tự sắp xếp phải là chuỗi')
    .isIn(['asc', 'desc'])
    .withMessage('Thứ tự sắp xếp phải là asc hoặc desc')
];
