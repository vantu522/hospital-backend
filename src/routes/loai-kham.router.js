import express from 'express';
import loaiKhamController from '../app/controllers/loai-kham.controller.js';
import { 
  validateCreateLoaiKham, 
  validateUpdateLoaiKham, 
  validateIdParam,
  validatePagination
} from '../app/middlewares/loai-kham.validator.js';
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const router = express.Router();

// Admin/SuperAdmin routes (chỉ admin/superadmin được truy cập)
router.get('/', requireAdminOrSuperadmin, validatePagination, loaiKhamController.getAll);
router.get('/active', requireAdminOrSuperadmin, loaiKhamController.getActive);
router.get('/:id', requireAdminOrSuperadmin, validateIdParam, loaiKhamController.getById);

// Admin/SuperAdmin routes (thao tác dữ liệu)
router.post('/', requireAdminOrSuperadmin, validateCreateLoaiKham, loaiKhamController.create);
router.put('/:id', requireAdminOrSuperadmin, validateUpdateLoaiKham, loaiKhamController.update);
router.delete('/:id', requireAdminOrSuperadmin, validateIdParam, loaiKhamController.delete);
router.patch('/:id/restore', requireAdminOrSuperadmin, validateIdParam, loaiKhamController.restore);

export default router;
