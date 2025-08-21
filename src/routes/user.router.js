import { Router } from 'express';
import * as userController from '../app/controllers/user.controller.js'
import { requireSuperAdmin, requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const userRouter = Router();

userRouter.get('/', requireAdminOrSuperadmin, userController.getUsers);
// Tạo user (chỉ superadmin, admin)
userRouter.post('/', requireSuperAdmin, userController.createUser);
userRouter.post('/login', userController.login);

export default userRouter;
