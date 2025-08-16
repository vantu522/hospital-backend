import healthConsultationService from '../services/health-consultation.service.js';

/**
 * @swagger
 * /api/health-consultations:
 *   post:
 *     summary: Create a new health consultation (Admin only)
 *     tags: [Health Consultations]
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
 *               - specialty_id
 *             properties:
 *               title:
 *                 type: string
 *                 description: Health consultation title
 *                 example: "Tư vấn sức khỏe tim mạch"
 *               description:
 *                 type: string
 *                 description: Health consultation description
 *               specialty_id:
 *                 type: string
 *                 description: Specialty ID
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Consultation image
 *     responses:
 *       201:
 *         description: Health consultation created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const createHealthConsultation = async (req, res) => {
  try {
    const result = await healthConsultationService.createHealthConsultation(req.body, { image: req.file ? [req.file] : null });
    res.status(201).json({
      success: true,
      message: 'Tạo tư vấn sức khỏe thành công',
      data: result
    });
  } catch (error) {
    console.error('Create health consultation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/health-consultations:
 *   get:
 *     summary: Get all health consultations
 *     tags: [Health Consultations]
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
 *         description: Number of items per page
 *       - in: query
 *         name: specialty_id
 *         schema:
 *           type: string
 *         description: Filter by specialty ID
 *     responses:
 *       200:
 *         description: List of health consultations
 */
const getAllHealthConsultations = async (req, res) => {
  try {
    const result = await healthConsultationService.getAllHealthConsultations(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get health consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/health-consultations/{id}:
 *   get:
 *     summary: Get health consultation by ID
 *     tags: [Health Consultations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health consultation ID
 *     responses:
 *       200:
 *         description: Health consultation details
 *       404:
 *         description: Health consultation not found
 */
const getHealthConsultationById = async (req, res) => {
  try {
    const consultation = await healthConsultationService.getHealthConsultationById(req.params.id);
    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Get health consultation by ID error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/health-consultations/{id}:
 *   put:
 *     summary: Update health consultation (Admin only)
 *     tags: [Health Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health consultation ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Health consultation title
 *               description:
 *                 type: string
 *                 description: Health consultation description
 *               specialty_id:
 *                 type: string
 *                 description: Specialty ID
 *               is_active:
 *                 type: boolean
 *                 description: Is consultation active
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New consultation image (optional)
 *     responses:
 *       200:
 *         description: Health consultation updated successfully
 *       404:
 *         description: Health consultation not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const updateHealthConsultation = async (req, res) => {
  try {
    const result = await healthConsultationService.updateHealthConsultation(
      req.params.id, 
      req.body, 
      { image: req.file ? [req.file] : null }
    );
    res.json({
      success: true,
      message: 'Cập nhật tư vấn sức khỏe thành công',
      data: result
    });
  } catch (error) {
    console.error('Update health consultation error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/health-consultations/{id}:
 *   delete:
 *     summary: Delete health consultation (Admin only)
 *     tags: [Health Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health consultation ID
 *     responses:
 *       200:
 *         description: Health consultation deleted successfully
 *       404:
 *         description: Health consultation not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const deleteHealthConsultation = async (req, res) => {
  try {
    const result = await healthConsultationService.deleteHealthConsultation(req.params.id);
    res.json({
      success: true,
      message: 'Xóa tư vấn sức khỏe thành công'
    });
  } catch (error) {
    console.error('Delete health consultation error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/health-consultations/slug/{slug}:
 *   get:
 *     summary: Get health consultation by slug
 *     tags: [Health Consultations]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Health consultation slug
 *         example: "tu-van-suc-khoe-tim-mach"
 *     responses:
 *       200:
 *         description: Health consultation details
 *       404:
 *         description: Health consultation not found
 */
const getHealthConsultationBySlug = async (req, res) => {
  try {
    const consultation = await healthConsultationService.getHealthConsultationBySlug(req.params.slug);
    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Get health consultation by slug error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export { 
  createHealthConsultation, 
  getAllHealthConsultations, 
  getHealthConsultationById, 
  getHealthConsultationBySlug,
  updateHealthConsultation, 
  deleteHealthConsultation 
};
