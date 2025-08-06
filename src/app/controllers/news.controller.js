import News from '../../models/news.model.js';
import { generateSlug } from '../../utils/slug.js';
import { paginate } from '../../utils/pagination.js';

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
 *                 description: News content
 *               category:
 *                 type: string
 *                 description: News category
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: News tags
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Featured image
 *     responses:
 *       201:
 *         description: News created successfully
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
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const createNews = async (req, res) => {
  try {
    const { title, description, content, category, tags } = req.body;
    const imageUrl = req.file?.path || '';

    // Validation - Kiểm tra tất cả field bắt buộc
    if (!title || !description || !content || !category || !tags) {
      return res.status(400).json({
        success: false,
        message: 'Tất cả các trường đều bắt buộc: title, description, content, category, tags'
      });
    }

    // Kiểm tra tags không được rỗng
    const processedTags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []);
    if (processedTags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tags không được để trống'
      });
    }

    // Tạo slug từ title
    const slug = generateSlug(title);

    // Kiểm tra slug đã tồn tại chưa
    const existingNews = await News.findOne({ slug });
    let finalSlug = slug;
    if (existingNews) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    const newsData = {
      title: title.trim(),
      slug: finalSlug,
      description: description.trim(),
      content: content.trim(),
      image: imageUrl,
      category: category.trim(),
      tags: processedTags,
      publish_date: new Date(),
      is_active: true,
      view_count: 0
    };

    const news = await News.create(newsData);

    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: news
    });

  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of articles per page
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
const getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Build query - không có điều kiện gì, lấy tất cả tin tức
    const query = {};

    // Kế thừa pagination utility với options đơn giản
    const result = await paginate(News, query, {
      page,
      limit: Math.min(limit, 100), // Giới hạn max 100
      sort: { publish_date: -1 }    // Luôn sắp xếp theo mới nhất
    });

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
 *         description: News slug
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
 *         description: News not found
 */
const getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug});
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Tăng view count
    await News.findOneAndUpdate(
      { slug: req.params.slug }, 
      { $inc: { view_count: 1 } }
    );

    res.json({
      success: true,
      data: news
    });

  } catch (error) {
    console.error('Get news by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
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
 *         description: News ID
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
 *         description: News not found
 */
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Tăng view count
    await News.findByIdAndUpdate(req.params.id, { 
      $inc: { view_count: 1 } 
    });

    res.json({
      success: true,
      data: news
    });

  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Update news article (Admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
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
 *                 description: News content
 *               category:
 *                 type: string
 *                 description: News category
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: News tags
 *               is_active:
 *                 type: boolean
 *                 description: Is article active
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New featured image (optional)
 *     responses:
 *       200:
 *         description: News updated successfully
 *       404:
 *         description: News not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Update news request - ID:', id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? {
      filename: req.file.filename,
      path: req.file.path,
      originalname: req.file.originalname
    } : 'No file uploaded');

    // Tìm bài viết hiện tại
    const currentNews = await News.findById(id);
    if (!currentNews) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const updateData = { ...req.body };

    // Xử lý tags nếu có
    if (req.body.tags) {
      const processedTags = Array.isArray(req.body.tags) 
        ? req.body.tags 
        : req.body.tags.split(',').map(tag => tag.trim());
      updateData.tags = processedTags;
    }

    // Xử lý title và slug nếu có
    if (updateData.title && updateData.title.trim() !== '') {
      const newTitle = updateData.title.trim();
      const newSlug = generateSlug(newTitle);
      
      // Kiểm tra slug trùng với bài viết khác (trừ bài viết hiện tại)
      if (newSlug !== currentNews.slug) {
        const existingNews = await News.findOne({ 
          slug: newSlug, 
          _id: { $ne: id } 
        });
        if (existingNews) {
          updateData.slug = `${newSlug}-${Date.now()}`;
        } else {
          updateData.slug = newSlug;
        }
      }
      updateData.title = newTitle;
    }

    // Xử lý ảnh mới nếu có
    if (req.file) {
      updateData.image = req.file.path;
      console.log('New image path:', req.file.path);
      
      // TODO: Có thể xóa ảnh cũ nếu cần
      // if (currentNews.image && currentNews.image !== req.file.path) {
      //   try {
      //     const oldImagePath = path.resolve(currentNews.image);
      //     if (fs.existsSync(oldImagePath)) {
      //       fs.unlinkSync(oldImagePath);
      //     }
      //   } catch (error) {
      //     console.log('Error deleting old image:', error);
      //   }
      // }
    }

    updateData.updatedAt = new Date();

    console.log('Final update data:', updateData);

    const updatedNews = await News.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: updatedNews
    });

  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Delete news article (Admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     responses:
 *       200:
 *         description: News deleted successfully
 *       404:
 *         description: News not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const deleteNews = async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    
    if (!deletedNews) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    res.json({
      success: true,
      message: 'Xóa bài viết thành công'
    });

  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

export { createNews, getAllNews, getNewsById, getNewsBySlug, updateNews, deleteNews };