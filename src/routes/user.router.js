import { Router } from 'express';
import * as userController from '../app/controllers/user.controller.js'
import { requireSuperAdmin, requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const userRouter = Router();

userRouter.get('/', requireAdminOrSuperadmin, userController.getUsers);
userRouter.post('/', (req, res, next) => {
  const { role } = req.body;
  if (role === 'admin') {
    return requireSuperAdmin(req, res, next);
  }
  if (role === 'receptionist') {
    return requireAdminOrSuperadmin(req, res, next);
  }
  // Nếu role khác, có thể xử lý tiếp hoặc trả về lỗi
  return res.status(400).json({ success: false, message: 'Role không hợp lệ hoặc chưa được hỗ trợ' });
}, userController.createUser);
userRouter.post('/login', userController.login);

export default userRouter;
