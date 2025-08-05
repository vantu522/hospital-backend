import { Router } from 'express';
import recruitmentController from '../app/controllers/recruitment.controller.js';
import upload from '../app/middlewares/upload.js';

const recruitmentRouter = Router();

recruitmentRouter.post('/', upload.fields([
    { name: 'document', maxCount: 2 }

]),recruitmentController.createRecruitment);
recruitmentRouter.get('/', recruitmentController.getAllRecruitments);
recruitmentRouter.get('/:id', recruitmentController.getRecruitmentById);
recruitmentRouter.put('/:id', recruitmentController.updateRecruitment);
recruitmentRouter.delete('/:id', recruitmentController.deleteRecruitment);

export default recruitmentRouter;