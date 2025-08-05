import { Router } from 'express';
import * as userController from '../app/controllers/user.controller.js'
import * as contactController from '../app/controllers/contact.controller.js';
import { validate } from '../app/middlewares/validate.js';
import { createContact } from '../app/request/contact.request.js';

const userRouter = Router();

userRouter.get('/', userController.getUsers);
userRouter.post('/', userController.createUser);
userRouter.post('/login', userController.login);

export default userRouter;
