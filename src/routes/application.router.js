import express from 'express';
import applicationController from '../app/controllers/application.controller.js';
import { uploadPDF } from '../utils/uploadPDF.js';
// import { authenticateToken, requireAdmin } from '../app/middlewares/validate.js'; // TODO: Uncomment for production

const router = express.Router();

// Public route - Ứng viên nộp đơn
router.post('/', uploadPDF.single('cvFileUrl'), applicationController.createApplication);


router.get('/', applicationController.getAllApplications);
router.get('/:id/download-cv', applicationController.downloadCV);
router.get('/:id', applicationController.getApplicationById);
router.patch('/:id/status', applicationController.updateApplicationStatus);
router.put('/:id', uploadPDF.single('cvFileUrl'), applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

export default router;
