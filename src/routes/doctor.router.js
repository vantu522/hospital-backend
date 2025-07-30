import { Router } from 'express';
import * as doctorCtrl from '../app/controllers/doctor.controller.js';
const doctorRouter = Router();

doctorRouter.post('/', doctorCtrl.createDoctor);
doctorRouter.get('/', doctorCtrl.getAllDoctors);
doctorRouter.get('/:id', doctorCtrl.getDoctorById);
doctorRouter.put('/:id', doctorCtrl.updateDoctor);
doctorRouter.delete('/:id', doctorCtrl.deleteDoctor);

export default doctorRouter;
