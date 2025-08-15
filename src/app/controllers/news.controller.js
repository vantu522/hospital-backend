import newsService from '../services/news.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - content
 *         - category
 *         - tags
 *       properties:
 *         _id:
 *           type: string
 *           description: News ID
 *         title:
 *           type: string
 *           description: News title
 *         slug:
 *           type: string
 *           description: URL-friendly version of title
 *         description:
 *           type: string
 *           description: Short description
 *         content:
 *           type: string
 *           description: Full content
 *         image:
 *           type: string
 *           description: Image URL
 *         category:
 *           type: string
 *           description: News category
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Article tags
 *         publish_date:
 *           type: string
 *           format: date-time
 *           description: Publication date
 *         is_active:
 *           type: boolean
 *           description: Is article active
 *         view_count:
 *           type: integer
 *           description: View count
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create a new news article (Admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - content
 *               - category
 *               - tags
 *             properties:
 *               title:
 *                 type: string
 *                 description: News title
 *               description:
 *                 type: string
 *                 description: Short description
 *               content:
 *                 type: string
 *                 description: Full content
 *               category:
 *                 type: string
 *                 description: News category
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: News image
 *     responses:
 *       201:
 *         description: News created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const createNews = async (req, res) => {
  try {
    const result = await newsService.createNews(req.body, { image: req.file ? [req.file] : null });
    res.status(201).json({
      success: true,
      message: 'Tạo tin tức thành công',
      data: result
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAllNews = async (req, res) => {
  try {
    const result = await newsService.getAllNews(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

const getNewsBySlug = async (req, res) => {
  try {
    const news = await newsService.getNewsBySlug(req.params.slug);
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news by slug error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await newsService.getNewsById(req.params.id);
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news by ID error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const updateNews = async (req, res) => {
  try {
    const result = await newsService.updateNews(req.params.id, req.body, { image: req.file ? [req.file] : null });
    res.json({
      success: true,
      message: 'Cập nhật tin tức thành công',
      data: result
    });
  } catch (error) {
    console.error('Update news error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const deleteNews = async (req, res) => {
  try {
    const result = await newsService.deleteNews(req.params.id);
    res.json({
      success: true,
      message: 'Xóa tin tức thành công'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export { createNews, getAllNews, getNewsById, getNewsBySlug, updateNews, deleteNews };
