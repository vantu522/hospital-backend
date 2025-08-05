import express from 'express';
import { 
  createHealthConsultation, 
  getAllHealthConsultations, 
  getHealthConsultationById, 
  updateHealthConsultation, 
  deleteHealthConsultation 
} from '../app/controllers/health-consultation.controller.js';
import { authenticateToken, requireAdmin } from '../app/middlewares/auth.js';
import upload from '../app/middlewares/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllHealthConsultations);
router.get('/:id', getHealthConsultationById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, upload.single('image'), createHealthConsultation);
router.put('/:id', authenticateToken, requireAdmin, updateHealthConsultation);
router.delete('/:id', authenticateToken, requireAdmin, deleteHealthConsultation);

export default router;
