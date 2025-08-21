import express from 'express';
import applicationController from '../app/controllers/application.controller.js';
import { uploadPDF } from '../utils/uploadPDF.js';
// import { authenticateToken, requireAdmin } from '../app/middlewares/validate.js'; // TODO: Uncomment for production
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const router = express.Router();

// Public route - Ứng viên nộp đơn
router.post('/', uploadPDF.single('cvFileUrl'), applicationController.createApplication);


router.get('/', requireAdminOrSuperadmin, applicationController.getAllApplications);
router.get('/:id/download-cv', requireAdminOrSuperadmin, applicationController.downloadCV);
router.get('/:id', requireAdminOrSuperadmin, applicationController.getApplicationById);
router.patch('/:id/status', requireAdminOrSuperadmin, applicationController.updateApplicationStatus);
router.put('/:id', requireAdminOrSuperadmin, uploadPDF.single('cvFileUrl'), applicationController.updateApplication);
router.delete('/:id', requireAdminOrSuperadmin, applicationController.deleteApplication);

export default router;
