import { Router } from 'express';
import newsController from '../app/controllers/news.controller.js';

const newsRoutes = Router();

newsRoutes.post('/', newsController.createNews);
newsRoutes.get('/', newsController.getAllNews);
newsRoutes.get('/:id', newsController.getNewsById);
newsRoutes.put('/:id', newsController.updateNews);
newsRoutes.delete('/:id', newsController.deleteNews);

export default newsRoutes;