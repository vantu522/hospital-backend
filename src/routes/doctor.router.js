import { Router } from 'express';
import * as doctorController from '../app/controllers/doctor.controller.js';
import upload from '../app/middlewares/upload.js';

const doctorRouter = Router();

doctorRouter.post('/',upload.fields([
    { name: 'avatar', maxCount: 1 }
]), doctorController.createDoctor);
doctorRouter.get('/', doctorController.getAllDoctors);
doctorRouter.get('/specialty/:specialtyId', doctorController.getDoctorsBySpecialty);
doctorRouter.get('/slug/:slug', doctorController.getDoctorBySlug);
doctorRouter.put('/:id', upload.fields([
    { name: 'avatar', maxCount: 1 }
]) ,doctorController.updateDoctor);
doctorRouter.delete('/:id', doctorController.deleteDoctor);
doctorRouter.get("/five-doctors",doctorController.getFiveRandomDoctors);


export default doctorRouter;
