import express from 'express';
import applicationController from '../app/controllers/application.controller.js';
import { uploadPDF } from '../utils/uploadPDF.js';
// import { authenticateToken, requireAdmin } from '../app/middlewares/validate.js'; // TODO: Uncomment for production

const router = express.Router();

// Public route - Ứng viên nộp đơn
router.post('/', uploadPDF.single('cvFile'), applicationController.createApplication);

// Admin-only routes - TODO: Add back authentication for production
// router.get('/', authenticateToken, requireAdmin, applicationController.getAllApplications);
// router.get('/:id', authenticateToken, requireAdmin, applicationController.getApplicationById);
// router.patch('/:id/status', authenticateToken, requireAdmin, applicationController.updateApplicationStatus);
// router.put('/:id', authenticateToken, requireAdmin, uploadPDF.single('cvFile'), applicationController.updateApplication);
// router.delete('/:id', authenticateToken, requireAdmin, applicationController.deleteApplication);

router.get('/', applicationController.getAllApplications);
router.get('/:id', applicationController.getApplicationById);
router.patch('/:id/status', applicationController.updateApplicationStatus);
router.put('/:id', uploadPDF.single('cvFile'), applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

export default router;
