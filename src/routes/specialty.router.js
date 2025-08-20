import { Router } from 'express';
import { 
  createSpecialty, 
  getAllSpecialties, 
  getSpecialtyBySlug, 
  updateSpecialty, 
  deleteSpecialty, 
  getSpecialtyWithDoctors
} from '../app/controllers/specialty.controller.js';
// import { authenticateToken, requireAdmin } from '../app/middlewares/auth.js'; // TODO: Uncomment for production
import upload from '../app/middlewares/upload.js';
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const specialtyRouter = Router();

// Public routes
specialtyRouter.get('/', getAllSpecialties);
specialtyRouter.get('/slug/:slug', getSpecialtyBySlug);
specialtyRouter.get('/:id/doctors', getSpecialtyWithDoctors);

// Admin only routes
specialtyRouter.post('/', requireAdminOrSuperadmin, upload.fields([
  { name: 'images', maxCount: 3 }
]), createSpecialty);

specialtyRouter.put('/:id', requireAdminOrSuperadmin, upload.fields([
  { name: 'images', maxCount: 3 }
]), updateSpecialty);

specialtyRouter.delete('/:id', requireAdminOrSuperadmin, deleteSpecialty);

export default specialtyRouter;