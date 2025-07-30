import { Router } from 'express';
import specialtyController from '../app/controllers/specialty.controller.js';

const specialtyRoutes = Router();

specialtyRoutes.post('/', specialtyController.createSpecialty);
specialtyRoutes.get('/', specialtyController.getAllSpecialties);
specialtyRoutes.get('/:id', specialtyController.getSpecialtyById);
specialtyRoutes.put('/:id', specialtyController.updateSpecialty);
specialtyRoutes.delete('/:id', specialtyController.deleteSpecialty);

export default specialtyRoutes;