import express from 'express';
import customerController from '../app/controllers/customer.controller.js';
import { validateCustomerRegister, validateCustomerLogin } from '../app/middlewares/customer.validator.js';
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const customerRouter = express.Router();

// Đăng ký customer
customerRouter.post('/register', validateCustomerRegister, customerController.register);

// Đăng nhập customer
customerRouter.post('/login', validateCustomerLogin, customerController.login);

// Tạo tài khoản lễ tân (receptionist)
router.post('/receptionist', requireAdminOrSuperadmin, customerController.createReceptionist);

export default router;
