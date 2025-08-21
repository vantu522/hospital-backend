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
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllHealthConsultations);
router.get('/slug/:slug', getHealthConsultationBySlug);
router.get('/:id', getHealthConsultationById);

router.post('/', requireAdminOrSuperadmin, upload.single('image'), createHealthConsultation);
router.put('/:id', requireAdminOrSuperadmin, upload.single('image'), updateHealthConsultation);
router.delete('/:id', requireAdminOrSuperadmin, deleteHealthConsultation);

export default router;
