import { body } from 'express-validator';

// Validation cho đăng ký customer
export const validateCustomerRegister = [
  body('full_name')
    .notEmpty()
    .withMessage('Họ tên không được để trống')
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải từ 2-100 ký tự'),

  body('phone_number')
    .notEmpty()
    .withMessage('Số điện thoại không được để trống')
    .isMobilePhone('vi-VN')
    .withMessage('Số điện thoại không hợp lệ'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('citizen_id')
    .notEmpty()
    .withMessage('Số CMND/CCCD không được để trống')
    .isLength({ min: 9, max: 12 })
    .withMessage('Số CMND/CCCD phải từ 9-12 ký tự')
    .isNumeric()
    .withMessage('Số CMND/CCCD chỉ được chứa số'),

  body('date_of_birth')
    .notEmpty()
    .withMessage('Ngày sinh không được để trống')
    .isISO8601()
    .withMessage('Ngày sinh không hợp lệ'),

  body('gender')
    .notEmpty()
    .withMessage('Giới tính không được để trống')
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính phải là male, female hoặc other'),

  body('address')
    .notEmpty()
    .withMessage('Địa chỉ không được để trống')
    .isLength({ min: 10, max: 200 })
    .withMessage('Địa chỉ phải từ 10-200 ký tự'),

  body('health_insurance_number')
    .notEmpty()
    .withMessage('Số thẻ BHYT không được để trống')
    .isLength({ min: 10, max: 15 })
    .withMessage('Số thẻ BHYT không hợp lệ'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

// Validation cho đăng nhập customer
export const validateCustomerLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Số điện thoại hoặc email không được để trống'),

  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
];
