import { Router } from 'express';
import newsController from '../app/controllers/news.controller.js';

const newsRouter = Router();

newsRouter.post('/', newsController.createNews);
newsRouter.get('/', newsController.getAllNews);
newsRouter.get('/:id', newsController.getNewsById);
newsRouter.put('/:id', newsController.updateNews);
newsRouter.delete('/:id', newsController.deleteNews);

export default newsRouter;