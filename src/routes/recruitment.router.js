import { Router } from 'express';
import recruitmentController from '../app/controllers/recruitment.controller.js';

const recruitmentRouter = Router();

recruitmentRouter.post('/', recruitmentController.createRecruitment);
recruitmentRouter.get('/', recruitmentController.getAllRecruitments);
recruitmentRouter.get('/:id', recruitmentController.getRecruitmentById);
recruitmentRouter.put('/:id', recruitmentController.updateRecruitment);
recruitmentRouter.delete('/:id', recruitmentController.deleteRecruitment);

export default recruitmentRouter;