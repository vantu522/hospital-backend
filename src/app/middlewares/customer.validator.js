import Joi from 'joi';

const customerSchema = Joi.object({
  phone_number: Joi.string()
    .length(10)
    .pattern(/^0[0-9]{9}$/)
    .required()
    .messages({
      'string.base': 'Số điện thoại phải là chuỗi',
      'string.empty': 'Số điện thoại không được để trống',
      'string.length': 'Số điện thoại phải đủ 10 số',
      'string.pattern.base': 'Số điện thoại không hợp lệ',
      'any.required': 'Số điện thoại không được để trống'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.base': 'Mật khẩu phải là chuỗi',
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu không được để trống'
    })
});

// Validation cho đăng ký customer
export function validateCustomerRegister(req, res, next) {
  const { error } = customerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ success: false, message: error.details.map(e => e.message).join(', ') });
  }
  next();
}


// Validation cho đăng nhập customer
export function validateCustomerLogin(req, res, next) {
  const { error } = customerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ success: false, message: error.details.map(e => e.message).join(', ') });
  }
  next();
}
