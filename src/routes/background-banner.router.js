import { Router } from 'express';
import * as backgroundBannerController from '../app/controllers/background-banner.controller.js';
import upload from '../app/middlewares/upload.js';
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const backgroundBannerRouter = Router();

backgroundBannerRouter.post('/', requireAdminOrSuperadmin, upload.fields([
    { name: 'image', maxCount: 1 }
]), backgroundBannerController.createBackgroundBanner);

backgroundBannerRouter.get('/', backgroundBannerController.getAllBackgroundBanners);
backgroundBannerRouter.get('/:id', backgroundBannerController.getBackgroundBannerById);

backgroundBannerRouter.put('/:id', requireAdminOrSuperadmin, upload.fields([
    { name: 'image', maxCount: 1 }
]), backgroundBannerController.updateBackgroundBanner);

backgroundBannerRouter.delete('/:id', requireAdminOrSuperadmin, backgroundBannerController.deleteBackgroundBanner);

export default backgroundBannerRouter;
