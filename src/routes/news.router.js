import express from 'express';
import { createNews, getAllNews, getNewsById, updateNews, deleteNews } from '../app/controllers/news.controller.js';
import { authenticateToken, requireAdmin } from '../app/middlewares/auth.js';
import upload from '../app/middlewares/upload.js';

const router = express.Router();

// Public routes - Mọi người có thể xem tin tức
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Admin-only routes - Chỉ admin mới có thể tạo/sửa/xóa tin tức
router.post('/',  upload.single('image'), createNews);
router.put('/:id',  updateNews);
router.delete('/:id',  deleteNews);

export default router;