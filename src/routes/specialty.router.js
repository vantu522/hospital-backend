import { Router } from 'express';
import specialtyController from '../app/controllers/specialty.controller.js';
import upload from '../app/middlewares/upload.js';
const specialtyRouter = Router();

specialtyRouter.post('/',upload.fields([
    { name: 'images', maxCount: 3 }
]), specialtyController.createSpecialty);
specialtyRouter.get('/', specialtyController.getAllSpecialties);
specialtyRouter.get('/:id', specialtyController.getSpecialtyById);
specialtyRouter.put('/:id',upload.fields([
    { name: 'images', maxCount: 3 }
])
     ,specialtyController.updateSpecialty);
specialtyRouter.delete('/:id', specialtyController.deleteSpecialty);

export default specialtyRouter;