import express from 'express';
import congKhamController from '../app/controllers/cong-kham.controller.js';
import { 
  validateCreateCongKham, 
  validateUpdateCongKham, 
  validateIdParam,
  validatePagination
} from '../app/middlewares/cong-kham.validator.js';
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const router = express.Router();

// Public routes (không cần auth - chỉ đọc dữ liệu)
router.get('/', validatePagination, congKhamController.getAll);
router.get('/active', congKhamController.getActive);
router.get('/:id', validateIdParam, congKhamController.getById);

// Admin/SuperAdmin routes (thao tác dữ liệu)
router.post('/', requireAdminOrSuperadmin, validateCreateCongKham, congKhamController.create);
router.put('/:id', requireAdminOrSuperadmin, validateUpdateCongKham, congKhamController.update);
router.delete('/:id', requireAdminOrSuperadmin, validateIdParam, congKhamController.delete);
router.patch('/:id/restore', requireAdminOrSuperadmin, validateIdParam, congKhamController.restore);

export default router;
