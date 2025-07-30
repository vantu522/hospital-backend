import { Router } from 'express';
import serviceController from '../app/controllers/service.controller.js';

const serviceRouter = Router();

  serviceRouter.post('/', serviceController.createService);
  serviceRouter.get('/', serviceController.getAllServices);
  serviceRouter.get('/:id', serviceController.getServiceById);
  serviceRouter.put('/:id', serviceController.updateService);
  serviceRouter.delete('/:id', serviceController.deleteService);


export default serviceRouter;