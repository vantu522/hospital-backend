import recruitmentService from '../services/recruitment.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Recruitment:
 *       type: object
 *       required:
 *         - title
 *         - specialty_id
 *         - recruitment_count
 *         - expiry_date
 *       properties:
 *         _id:
 *           type: string
 *           description: Recruitment ID
 *         title:
 *           type: string
 *           description: Recruitment title
 *         slug:
 *           type: string
 *           description: URL slug
 *         position:
 *           type: string
 *           description: Position name
 *         specialty_id:
 *           type: string
 *           description: Specialty ID reference
 *         description:
 *           type: string
 *           description: Job description
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           description: Job requirements
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *           description: Job benefits
 *         deadline:
 *           type: string
 *           format: date
 *           description: Application deadline
 *         location:
 *           type: string
 *           description: Work location
 *         contact_email:
 *           type: string
 *           format: email
 *           description: Contact email
 *         recruitment_count:
 *           type: number
 *           description: Number of positions
 *         expiry_date:
 *           type: string
 *           format: date-time
 *           description: Post expiry date
 *         document:
 *           type: string
 *           description: Document file path
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const recruitmentController = {
  /**
   * @swagger
   * /api/recruitments:
   *   post:
   *     summary: Create a new recruitment post (Admin only)
   *     tags: [Recruitments]
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
   *               - specialty_id
   *               - recruitment_count
   *               - expiry_date
   *             properties:
   *               title:
   *                 type: string
   *                 description: Recruitment title
   *               position:
   *                 type: string
   *                 description: Position name
   *               specialty_id:
   *                 type: string
   *                 description: Specialty ID
   *               description:
   *                 type: string
   *                 description: Job description
   *               requirements:
   *                 type: string
   *                 description: Comma-separated requirements
   *               benefits:
   *                 type: string
   *                 description: Comma-separated benefits
   *               deadline:
   *                 type: string
   *                 format: date
   *                 description: Application deadline
   *               location:
   *                 type: string
   *                 description: Work location
   *               contact_email:
   *                 type: string
   *                 format: email
   *                 description: Contact email
   *               recruitment_count:
   *                 type: number
   *                 description: Number of positions
   *               expiry_date:
   *                 type: string
   *                 format: date-time
   *                 description: Post expiry date
   *               document:
   *                 type: string
   *                 format: binary
   *                 description: PDF document
   *     responses:
   *       201:
   *         description: Recruitment created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin only
   */
  createRecruitment: async (req, res) => {
    try {
      const result = await recruitmentService.createRecruitment(req.body, req.file);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/recruitments:
   *   get:
   *     summary: Get all recruitment posts
   *     tags: [Recruitments]
   *     parameters:
   *       - in: query
   *         name: specialty_id
   *         schema:
   *           type: string
   *         description: Filter by specialty ID
   *       - in: query
   *         name: position
   *         schema:
   *           type: string
   *         description: Filter by position
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *         description: Filter by location
   *     responses:
   *       200:
   *         description: List of recruitment posts
   *       500:
   *         description: Server error
   */
  getAllRecruitments: async (req, res) => {
    try {
      const result = await recruitmentService.getAllRecruitments(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/recruitments/{id}:
   *   get:
   *     summary: Get recruitment by ID
   *     tags: [Recruitments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Recruitment ID
   *     responses:
   *       200:
   *         description: Recruitment details
   *       404:
   *         description: Recruitment not found
   *       500:
   *         description: Server error
   */
  getRecruitmentById: async (req, res) => {
    try {
      const recruitment = await recruitmentService.getRecruitmentById(req.params.id);
      res.json(recruitment);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  },
  
  /**
   * @swagger
   * /api/recruitments/slug/{slug}:
   *   get:
   *     summary: Get recruitment by slug
   *     tags: [Recruitments]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *         description: Recruitment slug
   *     responses:
   *       200:
   *         description: Recruitment details
   *       404:
   *         description: Recruitment not found
   *       500:
   *         description: Server error
   */
  getRecruitmentBySlug: async (req, res) => {
    try {
      const recruitment = await recruitmentService.getRecruitmentBySlug(req.params.slug);
      res.json(recruitment);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/recruitments/{id}:
   *   put:
   *     summary: Update recruitment by ID (Admin only)
   *     tags: [Recruitments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Recruitment ID
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               position:
   *                 type: string
   *               specialty_id:
   *                 type: string
   *               description:
   *                 type: string
   *               requirements:
   *                 type: string
   *               benefits:
   *                 type: string
   *               deadline:
   *                 type: string
   *                 format: date
   *               location:
   *                 type: string
   *               contact_email:
   *                 type: string
   *                 format: email
   *               recruitment_count:
   *                 type: number
   *               expiry_date:
   *                 type: string
   *                 format: date-time
   *               document:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Recruitment updated successfully
   *       404:
   *         description: Recruitment not found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin only
   */
updateRecruitment: async (req, res) => {
  try {
    const result = await recruitmentService.updateRecruitment(req.params.id, req.body, req.file);
    res.json(result);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({ error: err.message });
  }
},

  /**
   * @swagger
   * /api/recruitments/{id}:
   *   delete:
   *     summary: Delete recruitment by ID (Admin only)
   *     tags: [Recruitments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Recruitment ID
   *     responses:
   *       200:
   *         description: Recruitment deleted successfully
   *       404:
   *         description: Recruitment not found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin only
   */
  deleteRecruitment: async (req, res) => {
    try {
      const result = await recruitmentService.deleteRecruitment(req.params.id);
      res.json(result);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/recruitments/{id}/download:
   *   get:
   *     summary: Download recruitment document
   *     tags: [Recruitments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Recruitment ID
   *     responses:
   *       200:
   *         description: Document file
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Document not found
   *       500:
   *         description: Server error
   */
  downloadDocument: async (req, res) => {
    try {
      const result = await recruitmentService.downloadDocument(req.params.id);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.fileName)}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Stream the file
      result.stream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false,
            message: 'Lỗi khi đọc file tài liệu' 
          });
        }
      });

      result.stream.pipe(res);
      
    } catch (error) {
      console.error('Download document error:', error);
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

};

export default recruitmentController;