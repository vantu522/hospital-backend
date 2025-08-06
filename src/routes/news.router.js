import express from 'express';
import { createNews, getAllNews, getNewsById, getNewsBySlug, updateNews, deleteNews } from '../app/controllers/news.controller.js';
// import { authenticateToken, requireAdmin } from '../app/middlewares/auth.js'; // TODO: Uncomment for production
import upload from '../app/middlewares/upload.js';

const router = express.Router();

// Public routes - Mọi người có thể xem tin tức
router.get('/', getAllNews);
router.get('/slug/:slug', getNewsBySlug);
router.get('/:id', getNewsById);

// Admin-only routes - TODO: Add back authentication for production
// router.post('/', authenticateToken, requireAdmin, upload.single('image'), createNews);
// router.put('/:id', authenticateToken, requireAdmin, updateNews);
// router.delete('/:id', authenticateToken, requireAdmin, deleteNews);

router.post('/', upload.single('image'), createNews);
router.put('/:id',upload.single('image'), updateNews);
router.delete('/:id', deleteNews);

export default router;