import { Router } from 'express';
import * as userController from '../app/controllers/user.controller.js'
import * as contactContrller from '../app/controllers/contact.controller.js';

const userRouter = Router();

userRouter.get('/', userController.getUsers);
userRouter.post('/', userController.createUser);

userRouter.post('/contact', contactContrller.createContact);

export default userRouter;
