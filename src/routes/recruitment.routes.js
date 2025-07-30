import { Router } from 'express';
import recruitmentController from '../app/controllers/recruitment.controller.js';

const recruitmentRoutes = Router();

recruitmentRoutes.post('/', recruitmentController.createRecruitment);
recruitmentRoutes.get('/', recruitmentController.getAllRecruitments);
recruitmentRoutes.get('/:id', recruitmentController.getRecruitmentById);
recruitmentRoutes.put('/:id', recruitmentController.updateRecruitment);
recruitmentRoutes.delete('/:id', recruitmentController.deleteRecruitment);

export default recruitmentRoutes;