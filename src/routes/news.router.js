import { Router } from 'express';
import newsController from '../app/controllers/news.controller.js';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const newsRouter = Router();
const upload = multer({storage})

newsRouter.post('/', upload.single('image'),newsController.createNews);
newsRouter.get('/', newsController.getAllNews);
newsRouter.get('/:id', newsController.getNewsById);
newsRouter.put('/:id', newsController.updateNews);
newsRouter.delete('/:id', newsController.deleteNews);

export default newsRouter;