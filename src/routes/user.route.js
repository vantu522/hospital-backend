import { Router } from 'express';
import * as userController from '../app/controllers/user.controller.js'
import { createUser } from '../app/controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/', userController.getUsers);
userRouter.post('/', userController.createUser);

export default userRouter;
