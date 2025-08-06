import Application from '../../models/application.model.js';
import { paginate, getPaginationParams } from '../../utils/pagination.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      const { name, email, phone, coverLetter } = req.body;
      
      // Validate required fields
      if (!name || !email || !phone) {
        return res.status(400).json({ 
          error: 'Name, email, and phone are required fields' 
        });
      }

      const applicationData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        coverLetter: coverLetter || '',
        cvFileUrl: req.file ? req.file.filename : null
      };

      console.log('File upload info:', req.file ? {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        destination: req.file.destination,
        savedToDatabase: req.file.filename
      } : 'No file uploaded');

      const application = new Application(applicationData);
      await application.save();
      
      res.status(201).json({
        message: 'Application submitted successfully',
        application
      });
    } catch (err) {
      // Delete uploaded file if application creation fails
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteErr) {
          console.error('Error deleting file:', deleteErr);
        }
      }
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
      const { status } = req.query;
      
      // Build filter
      const filter = {};
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        filter.status = status;
      }

      // Get pagination parameters
      const paginationOptions = getPaginationParams(req.query);

      // Use pagination utility
      const result = await paginate(Application, filter, paginationOptions);

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
      const application = await Application.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển' });
      }
      res.json(application);
    } catch (err) {
      res.status(500).json({ error: err.message });
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
      const { status } = req.body;
      
      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ 
          error: 'Status must be one of: pending, approved, rejected' 
        });
      }

      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );

      if (!application) {
        return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển' });
      }

      res.json({
        message: 'Application status updated successfully',
        application
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
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
      const updateData = {};
      const { name, email, phone, coverLetter, status } = req.body;

      // Build update object
      if (name) updateData.name = name.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (phone) updateData.phone = phone.trim();
      if (coverLetter !== undefined) updateData.coverLetter = coverLetter;
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        updateData.status = status;
      }

      // Handle file upload
      if (req.file) {
        // Get current application to delete old file
        const currentApplication = await Application.findById(req.params.id);
        if (currentApplication && currentApplication.cvFileUrl) {
          try {
            fs.unlinkSync(currentApplication.cvFileUrl);
          } catch (deleteErr) {
            console.error('Error deleting old file:', deleteErr);
          }
        }
        updateData.cvFileUrl = req.file.path;
      }

      const application = await Application.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!application) {
        // Delete uploaded file if application not found
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (deleteErr) {
            console.error('Error deleting file:', deleteErr);
          }
        }
        return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển' });
      }

      res.json({
        message: 'Application updated successfully',
        application
      });
    } catch (err) {
      // Delete uploaded file if update fails
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteErr) {
          console.error('Error deleting file:', deleteErr);
        }
      }
      res.status(400).json({ error: err.message });
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
      const application = await Application.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển' });
      }

      // Delete associated CV file
      if (application.cvFileUrl) {
        try {
          fs.unlinkSync(application.cvFileUrl);
        } catch (deleteErr) {
          console.error('Error deleting file:', deleteErr);
        }
      }

      await Application.findByIdAndDelete(req.params.id);
      res.json({ message: 'Đã xóa đơn ứng tuyển' });
    } catch (err) {
      res.status(500).json({ error: err.message });
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
      const { id } = req.params;
      
      // Find application
      const application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Đơn ứng tuyển không tồn tại'
        });
      }

      // Check if CV file exists
      if (!application.cvFileUrl) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy file CV'
        });
      }

      console.log('Application cvFileUrl from database:', application.cvFileUrl);

      // Build file path - Combine fixed uploads/pdfs path with filename from database
      const filePath = path.resolve(__dirname, '../../../uploads/pdfs', application.cvFileUrl);
      
      console.log('Checking file path:', filePath);
      
      // Check if file exists on disk
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File CV không tồn tại trên server',
          filePath: filePath
        });
      }

      // Set headers for file download
      const safeName = application.name.replace(/[^a-zA-Z0-9]/g, '_'); // Remove special characters
      const fileName = `CV_${safeName}_${application._id}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false,
            message: 'Lỗi khi đọc file CV' 
          });
        }
      });

      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Download CV error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tải xuống CV'
      });
    }
  }
};

export default applicationController;
