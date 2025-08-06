import { Router } from 'express';
import { 
  createSpecialty, 
  getAllSpecialties, 
  getSpecialtyBySlug, 
  updateSpecialty, 
  deleteSpecialty 
} from '../app/controllers/specialty.controller.js';
// import { authenticateToken, requireAdmin } from '../app/middlewares/auth.js'; // TODO: Uncomment for production
import upload from '../app/middlewares/upload.js';

const specialtyRouter = Router();

// Public routes
specialtyRouter.get('/', getAllSpecialties);
specialtyRouter.get('/slug/:slug', getSpecialtyBySlug);

// Admin only routes - TODO: Add back authentication for production
// specialtyRouter.post('/', authenticateToken, requireAdmin, upload.fields([
//   { name: 'images', maxCount: 3 }
// ]), createSpecialty);
// specialtyRouter.put('/:id', authenticateToken, requireAdmin, upload.fields([
//   { name: 'images', maxCount: 3 }
// ]), updateSpecialty);
// specialtyRouter.delete('/:id', authenticateToken, requireAdmin, deleteSpecialty);

specialtyRouter.post('/', upload.fields([
  { name: 'images', maxCount: 3 }
]), createSpecialty);

specialtyRouter.put('/:id', upload.fields([
  { name: 'images', maxCount: 3 }
]), updateSpecialty);

specialtyRouter.delete('/:id', deleteSpecialty);

export default specialtyRouter;