import { Router } from 'express';
import * as backgroundBannerController from '../app/controllers/background-banner.controller.js';
import upload from '../app/middlewares/upload.js';

const backgroundBannerRouter = Router();

backgroundBannerRouter.post('/', upload.fields([
    { name: 'image', maxCount: 1 }
]), backgroundBannerController.createBackgroundBanner);

backgroundBannerRouter.get('/', backgroundBannerController.getAllBackgroundBanners);
backgroundBannerRouter.get('/:id', backgroundBannerController.getBackgroundBannerById);

backgroundBannerRouter.put('/:id', upload.fields([
    { name: 'image', maxCount: 1 }
]), backgroundBannerController.updateBackgroundBanner);

backgroundBannerRouter.delete('/:id', backgroundBannerController.deleteBackgroundBanner);

export default backgroundBannerRouter;
