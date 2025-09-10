import express from 'express';
import khoaKhamController from '../app/controllers/khoa-kham.controller.js';
import { 
  validateCreateKhoaKham, 
  validateUpdateKhoaKham, 
  validateIdParam,
  validatePagination
} from '../app/middlewares/khoa-kham.validator.js';
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const router = express.Router();

// Admin/SuperAdmin routes (chỉ admin/superadmin được truy cập)
router.get('/', requireAdminOrSuperadmin, validatePagination, khoaKhamController.getAll);
router.get('/active', requireAdminOrSuperadmin, khoaKhamController.getActive);
router.get('/:id', requireAdminOrSuperadmin, validateIdParam, khoaKhamController.getById);

// Admin/SuperAdmin routes (thao tác dữ liệu)
router.post('/', requireAdminOrSuperadmin, validateCreateKhoaKham, khoaKhamController.create);
router.put('/:id', requireAdminOrSuperadmin, validateUpdateKhoaKham, khoaKhamController.update);
router.delete('/:id', requireAdminOrSuperadmin, validateIdParam, khoaKhamController.delete);
router.patch('/:id/restore', requireAdminOrSuperadmin, validateIdParam, khoaKhamController.restore);

export default router;
