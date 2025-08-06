import { Router } from 'express';
import recruitmentController from '../app/controllers/recruitment.controller.js';
import { uploadPDF } from '../utils/uploadPDF.js';
const recruitmentRouter = Router();

recruitmentRouter.post('/',uploadPDF.single("document") ,recruitmentController.createRecruitment);
recruitmentRouter.get('/', recruitmentController.getAllRecruitments);
recruitmentRouter.get('/:id', recruitmentController.getRecruitmentById);
recruitmentRouter.get('/slug/:slug', recruitmentController.getRecruitmentBySlug);

recruitmentRouter.put('/:id', uploadPDF.single("document"),recruitmentController.updateRecruitment);
recruitmentRouter.delete('/:id', recruitmentController.deleteRecruitment);

export default recruitmentRouter;