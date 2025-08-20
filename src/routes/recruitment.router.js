import { Router } from 'express';
import recruitmentController from '../app/controllers/recruitment.controller.js';
import { uploadPDF } from '../utils/uploadPDF.js';
import { requireAdminOrSuperadmin, requireSuperAdmin } from '../app/middlewares/auth.js';
const recruitmentRouter = Router();

recruitmentRouter.post('/', requireAdminOrSuperadmin, uploadPDF.single("document"), recruitmentController.createRecruitment);
recruitmentRouter.get('/', recruitmentController.getAllRecruitments);
recruitmentRouter.get('/:id', recruitmentController.getRecruitmentById);
recruitmentRouter.get('/slug/:slug', recruitmentController.getRecruitmentBySlug);

recruitmentRouter.put('/:id', requireAdminOrSuperadmin, uploadPDF.single("document"), recruitmentController.updateRecruitment);
recruitmentRouter.delete('/:id', requireAdminOrSuperadmin, recruitmentController.deleteRecruitment);

export default recruitmentRouter;