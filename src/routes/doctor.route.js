import { Router } from 'express';
import * as doctorCtrl from '../app/controllers/doctor.controller.js';
const doctorRoutes = Router();

doctorRoutes.post('/', doctorCtrl.createDoctor);
doctorRoutes.get('/', doctorCtrl.getAllDoctors);
doctorRoutes.get('/:id', doctorCtrl.getDoctorById);
doctorRoutes.put('/:id', doctorCtrl.updateDoctor);
doctorRoutes.delete('/:id', doctorCtrl.deleteDoctor);

export default doctorRoutes;
