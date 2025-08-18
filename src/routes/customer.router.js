import express from 'express';
import customerController from '../app/controllers/customer.controller.js';
import { validateCustomerRegister, validateCustomerLogin } from '../app/middlewares/customer.validator.js';
import { validate } from '../app/middlewares/validate.js';

const customerRouter = express.Router();

// Đăng ký customer
customerRouter.post('/register', validateCustomerRegister, validate, customerController.register);

// Đăng nhập customer
customerRouter.post('/login', validateCustomerLogin, validate, customerController.login);

export default customerRouter;
