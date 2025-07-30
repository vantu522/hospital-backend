import { Router } from 'express';
import introduceController from '../app/controllers/introduce.controller.js';

const introduceRoutes = Router();

introduceRoutes.post('/', introduceController.createIntroduce);
introduceRoutes.get('/', introduceController.getAllIntroduces);
introduceRoutes.get('/:id', introduceController.getIntroduceById);
introduceRoutes.put('/:id', introduceController.updateIntroduce);
introduceRoutes.delete('/:id', introduceController.deleteIntroduce);

export default introduceRoutes;