import express from 'express';
import customerController from '../app/controllers/customer.controller.js';
import { validateCustomerRegister, validateCustomerLogin } from '../app/middlewares/customer.validator.js';
import { validate } from '../app/middlewares/validate.js';

const router = express.Router();

// Đăng ký customer
router.post('/register', validateCustomerRegister, validate, customerController.register);

// Đăng nhập customer
router.post('/login', validateCustomerLogin, validate, customerController.login);

export default router;
