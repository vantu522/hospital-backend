import applicationService from '../services/application.service.js';

const applicationController = {
  /**
   * @swagger
   * /api/applications:
   *   post:
   *     summary: Create a new job application
   *     description: Submit a new job application with CV upload
   *     tags: [Applications]
   *     consumes:
   *       - multipart/form-data
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - phone
   *             properties:
   *               name:
   *                 type: string
   *                 description: Applicant full name
   *                 example: "Nguyễn Văn A"
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Applicant email
   *                 example: "nguyenvana@email.com"
   *               phone:
   *                 type: string
   *                 description: Applicant phone number
   *                 example: "0987654321"
   *               coverLetter:
   *                 type: string
   *                 description: Cover letter content
   *                 example: "Tôi quan tâm đến vị trí này..."
   *               cvFile:
   *                 type: string
   *                 format: binary
   *                 description: CV file (PDF only)
   *     responses:
   *       201:
   *         description: Application created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Application'
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  createApplication: async (req, res) => {
    try {
      const result = await applicationService.createApplication(req.body, req.file);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/applications:
   *   get:
   *     summary: Get all job applications
   *     description: Retrieve all job applications with optional filtering (Admin only)
   *     tags: [Applications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, approved, rejected]
   *         description: Filter by application status
   *       - in: query
   *         name: page
   *         schema:
   *           type: number
   *           minimum: 1
   *         description: Page number for pagination
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 100
   *         description: Number of items per page
   *         example: 10
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *         description: Sort field (default createdAt)
   *         example: "name"
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Sort order (default desc)
   *         example: "desc"
   *     responses:
   *       200:
   *         description: List of applications retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 applications:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Application'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: number
   *                     limit:
   *                       type: number
   *                     total:
   *                       type: number
   *                     totalPages:
   *                       type: number
   *                     hasNextPage:
   *                       type: boolean
   *                     hasPrevPage:
   *                       type: boolean
   *                     nextPage:
   *                       type: number
   *                       nullable: true
   *                     prevPage:
   *                       type: number
   *                       nullable: true
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin access required
   *       500:
   *         description: Internal server error
   */
  getAllApplications: async (req, res) => {
    try {
      const result = await applicationService.getAllApplications(req.query);
      res.json({
        applications: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/applications/{id}:
   *   get:
   *     summary: Get application by ID
   *     description: Retrieve a specific application by its ID (Admin only)
   *     tags: [Applications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: ObjectId
   *         description: Application ID
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Application retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Application'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin access required
   *       404:
   *         description: Application not found
   *       500:
   *         description: Internal server error
   */
  getApplicationById: async (req, res) => {
    try {
      const application = await applicationService.getApplicationById(req.params.id);
      res.json(application);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/applications/{id}/status:
   *   patch:
   *     summary: Update application status
   *     description: Update the status of an application (Admin only)
   *     tags: [Applications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: ObjectId
   *         description: Application ID
   *         example: "507f1f77bcf86cd799439011"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, approved, rejected]
   *                 description: New application status
   *                 example: "approved"
   *     responses:
   *       200:
   *         description: Application status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Application'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin access required
   *       404:
   *         description: Application not found
   *       500:
   *         description: Internal server error
   */
  updateApplicationStatus: async (req, res) => {
    try {
      const result = await applicationService.updateApplicationStatus(req.params.id, req.body.status);
      res.json(result);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 400;
      res.status(statusCode).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/applications/{id}:
   *   put:
   *     summary: Update application
   *     description: Update application details with optional CV upload (Admin only)
   *     tags: [Applications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: ObjectId
   *         description: Application ID
   *         example: "507f1f77bcf86cd799439011"
   *     consumes:
   *       - multipart/form-data
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Applicant full name
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Applicant email
   *               phone:
   *                 type: string
   *                 description: Applicant phone number
   *               coverLetter:
   *                 type: string
   *                 description: Cover letter content
   *               status:
   *                 type: string
   *                 enum: [pending, approved, rejected]
   *                 description: Application status
   *               cvFile:
   *                 type: string
   *                 format: binary
   *                 description: New CV file (PDF only)
   *     responses:
   *       200:
   *         description: Application updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Application'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin access required
   *       404:
   *         description: Application not found
   *       500:
   *         description: Internal server error
   */
  updateApplication: async (req, res) => {
    try {
      const result = await applicationService.updateApplication(req.params.id, req.body, req.file);
      res.json(result);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 400;
      res.status(statusCode).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/applications/{id}:
   *   delete:
   *     summary: Delete application
   *     description: Delete an application and its associated CV file (Admin only)
   *     tags: [Applications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: ObjectId
   *         description: Application ID
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Application deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Đã xóa đơn ứng tuyển"
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin access required
   *       404:
   *         description: Application not found
   *       500:
   *         description: Internal server error
   */
  deleteApplication: async (req, res) => {
    try {
      const result = await applicationService.deleteApplication(req.params.id);
      res.json(result);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/applications/{id}/download-cv:
   *   get:
   *     summary: Download CV file
   *     description: Download the CV file associated with an application
   *     tags: [Applications]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Application ID
   *     responses:
   *       200:
   *         description: CV file downloaded successfully
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Application or CV file not found
   *       500:
   *         description: Internal server error
   */
  downloadCV: async (req, res) => {
    try {
      const result = await applicationService.downloadCV(req.params.id);
      
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
            message: 'Lỗi khi đọc file CV' 
          });
        }
      });

      result.stream.pipe(res);
      
    } catch (error) {
      console.error('Download CV error:', error);
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default applicationController;
