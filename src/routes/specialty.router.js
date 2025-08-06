import { Router } from 'express';
import { 
  createSpecialty, 
  getAllSpecialties, 
  getSpecialtyBySlug, 
  updateSpecialty, 
  deleteSpecialty 
} from '../app/controllers/specialty.controller.js';
import { authenticateToken, requireAdmin } from '../app/middlewares/auth.js';
import upload from '../app/middlewares/upload.js';

const specialtyRouter = Router();

// Public routes
specialtyRouter.get('/', getAllSpecialties);
specialtyRouter.get('/slug/:slug', getSpecialtyBySlug);

// Admin only routes
specialtyRouter.post('/', authenticateToken, requireAdmin, upload.fields([
  { name: 'images', maxCount: 3 }
]), createSpecialty);

specialtyRouter.put('/:id', authenticateToken, requireAdmin, upload.fields([
  { name: 'images', maxCount: 3 }
]), updateSpecialty);

specialtyRouter.delete('/:id', authenticateToken, requireAdmin, deleteSpecialty);

export default specialtyRouter;