import { Router } from 'express';
import serviceController from '../app/controllers/service.controller.js';

const serviceRoutes = Router();

  serviceRoutes.post('/services', serviceController.createService);
  serviceRoutes.get('/services', serviceController.getAllServices);
  serviceRoutes.get('/services/:id', serviceController.getServiceById);
  serviceRoutes.put('/services/:id', serviceController.updateService);
  serviceRoutes.delete('/services/:id', serviceController.deleteService);


export default serviceRoutes;