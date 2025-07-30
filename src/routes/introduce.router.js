import { Router } from 'express';
import introduceController from '../app/controllers/introduce.controller.js';

const introduceRouter = Router();

introduceRouter.post('/', introduceController.createIntroduce);
introduceRouter.get('/', introduceController.getAllIntroduces);
introduceRouter.get('/:id', introduceController.getIntroduceById);
introduceRouter.put('/:id', introduceController.updateIntroduce);
introduceRouter.delete('/:id', introduceController.deleteIntroduce);

export default introduceRouter;