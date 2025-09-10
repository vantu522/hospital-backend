import express from 'express';
import phongKhamController from '../app/controllers/phong-kham.controller.js';
import { 
  validateCreatePhongKham, 
  validateUpdatePhongKham, 
  validateIdParam,
  validatePagination
} from '../app/middlewares/phong-kham.validator.js';
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const router = express.Router();

// Public routes (không cần auth - chỉ đọc dữ liệu)
router.get('/', requireAdminOrSuperadmin,validatePagination, phongKhamController.getAll);
router.get('/active', phongKhamController.getActive);

router.get('/:id', validateIdParam, phongKhamController.getById);

// Admin/SuperAdmin routes (thao tác dữ liệu)
router.post('/', requireAdminOrSuperadmin, validateCreatePhongKham, phongKhamController.create);
router.put('/:id', requireAdminOrSuperadmin, validateUpdatePhongKham, phongKhamController.update);
router.delete('/:id', requireAdminOrSuperadmin, validateIdParam, phongKhamController.delete);
router.patch('/:id/restore', requireAdminOrSuperadmin, validateIdParam, phongKhamController.restore);

export default router;
