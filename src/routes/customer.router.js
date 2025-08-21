import express from 'express';
import customerController from '../app/controllers/customer.controller.js';
import { validateCustomerRegister, validateCustomerLogin } from '../app/middlewares/customer.validator.js';

const router = express.Router();

// Đăng ký customer
router.post('/register', validateCustomerRegister, customerController.register);

// Đăng nhập customer
router.post('/login', validateCustomerLogin, customerController.login);

export default router;
