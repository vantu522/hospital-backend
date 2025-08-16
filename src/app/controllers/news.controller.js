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

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get all news articles
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/news/slug/{slug}:
 *   get:
 *     summary: Get news article by slug
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: News article slug
 *         example: "tin-tuc-moi-nhat-ve-benh-vien"
 *     responses:
 *       200:
 *         description: News article details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       404:
 *         description: News article not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Get news article by ID
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
 *     responses:
 *       200:
 *         description: News article details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       404:
 *         description: News article not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Update news article by ID (Admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
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
 *               author:
 *                 type: string
 *                 description: Author name
 *               is_active:
 *                 type: boolean
 *                 description: Is article active
 *               publish_date:
 *                 type: string
 *                 format: date-time
 *                 description: Publication date
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New news image (optional)
 *     responses:
 *       200:
 *         description: News article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       404:
 *         description: News article not found
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
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

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Delete news article by ID (Admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News article ID
 *     responses:
 *       200:
 *         description: News article deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: News article not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
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

/**
 * @swagger
 * /api/news/latest:
 *   get:
 *     summary: Get latest news articles
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of latest articles to retrieve
 *     responses:
 *       200:
 *         description: List of latest news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *       500:
 *         description: Server error
 */
const getLatestNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const news = await newsService.getLatestNews(limit);
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get latest news error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/news/featured:
 *   get:
 *     summary: Get featured news articles (most viewed)
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of featured articles to retrieve
 *     responses:
 *       200:
 *         description: List of featured news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *       500:
 *         description: Server error
 */
const getFeaturedNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const news = await newsService.getFeaturedNews(limit);
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get featured news error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/news/category/{category}:
 *   get:
 *     summary: Get news articles by category
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: News category
 *         example: "sức khỏe"
 *     responses:
 *       200:
 *         description: List of news articles by category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *       500:
 *         description: Server error
 */
const getNewsByCategory = async (req, res) => {
  try {
    const news = await newsService.getNewsByCategory(req.params.category);
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/news/search:
 *   get:
 *     summary: Search news articles
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *         example: "tim mạch"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *       400:
 *         description: Missing search term
 *       500:
 *         description: Server error
 */
const searchNews = async (req, res) => {
  try {
    const { q: searchTerm, ...filters } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Từ khóa tìm kiếm là bắt buộc'
      });
    }

    const news = await newsService.searchNews(searchTerm, filters);
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Search news error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/news/statistics:
 *   get:
 *     summary: Get news statistics
 *     tags: [News]
 *     responses:
 *       200:
 *         description: News statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalNews:
 *                       type: integer
 *                       description: Total number of news articles
 *                     activeNews:
 *                       type: integer
 *                       description: Number of active news articles
 *                     totalViews:
 *                       type: integer
 *                       description: Total view count across all articles
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of categories
 *       500:
 *         description: Server error
 */
const getNewsStatistics = async (req, res) => {
  try {
    const stats = await newsService.getNewsStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get news statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

export { 
  createNews, 
  getAllNews, 
  getNewsById, 
  getNewsBySlug, 
  updateNews, 
  deleteNews,
  getLatestNews,
  getFeaturedNews,
  getNewsByCategory,
  searchNews,
  getNewsStatistics
};
