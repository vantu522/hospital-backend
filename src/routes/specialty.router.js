import { Router } from 'express';
import specialtyController from '../app/controllers/specialty.controller.js';

const specialtyRouter = Router();

specialtyRouter.post('/', specialtyController.createSpecialty);
specialtyRouter.get('/', specialtyController.getAllSpecialties);
specialtyRouter.get('/:id', specialtyController.getSpecialtyById);
specialtyRouter.put('/:id', specialtyController.updateSpecialty);
specialtyRouter.delete('/:id', specialtyController.deleteSpecialty);

export default specialtyRouter;