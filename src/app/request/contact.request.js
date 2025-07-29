import Joi from "joi";
import {
  MAX_STRING_SIZE,
  VALIDATE_FULL_NAME_REGEX,
  VALIDATE_PHONE_REGEX,
} from "../../config/constants.js";

export const createContact = Joi.object({
  full_name: Joi.string()
    .trim()
    .max(MAX_STRING_SIZE)
    .pattern(VALIDATE_FULL_NAME_REGEX)
    .required()
    .label("Họ và tên")
    .messages({
      "string.pattern.base":
        "{{#label}} không bao gồm số hay ký tực đặc biệt. ",
    }),
  phone_number: Joi.string()
    .trim()
    .pattern(VALIDATE_PHONE_REGEX)
    .allow("")
    .required()
    .label("Số điện thoại")
    .messages({
      "string.pattern.base": "{{#label}} không đúng định dạng.",
    }),
    email: Joi.string()
    .trim()
    .max(MAX_STRING_SIZE)
    .email()
    .required()
    .label("Email"),
    message: Joi.string()
    .trim()
    .max(1000)
    .required()
    .label("Nội dung")
    .messages({
        "string.empty": "{{#label}} không được để trống.",
        "string.max": "{{#label}} không được vượt quá {{#limit}} ký tự."
    })
  
});
