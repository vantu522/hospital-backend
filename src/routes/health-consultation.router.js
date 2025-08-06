import express from 'express';
import { 
  createHealthConsultation, 
  getAllHealthConsultations, 
  getHealthConsultationById, 
  getHealthConsultationBySlug,
  updateHealthConsultation, 
  deleteHealthConsultation 
} from '../app/controllers/health-consultation.controller.js';
// import { authenticateToken, requireAdmin } from '../app/middlewares/auth.js'; // TODO: Uncomment for production
import upload from '../app/middlewares/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllHealthConsultations);
router.get('/slug/:slug', getHealthConsultationBySlug);
router.get('/:id', getHealthConsultationById);

// Admin only routes - TODO: Add back authentication for production
// router.post('/', authenticateToken, requireAdmin, upload.single('image'), createHealthConsultation);
// router.put('/:id', authenticateToken, requireAdmin, updateHealthConsultation);
// router.delete('/:id', authenticateToken, requireAdmin, deleteHealthConsultation);
router.post('/', upload.single('image'), createHealthConsultation);
router.put('/:id', updateHealthConsultation);
router.delete('/:id', deleteHealthConsultation);

export default router;
