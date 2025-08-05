import HealthConsultation from '../../models/health-consultation.model.js';
import Department from '../../models/department.model.js';
import { paginate } from '../../utils/pagination.js';

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
 *               - description
 *               - department_id
 *             properties:
 *               description:
 *                 type: string
 *                 description: Health consultation description
 *               department_id:
 *                 type: string
 *                 description: Department ID
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
    const { description, department_id } = req.body;
    // Cloudinary sẽ trả về url trong req.file.path
    const imageUrl = req.file?.path || '';

    // Validation - Kiểm tra tất cả field bắt buộc
    if (!description || !department_id) {
      return res.status(400).json({
        success: false,
        message: 'Tất cả các trường đều bắt buộc: description, department_id'
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Ảnh là bắt buộc'
      });
    }

    // Kiểm tra department có tồn tại không
    const department = await Department.findById(department_id);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Khoa không tồn tại'
      });
    }

    const consultationData = {
      image: imageUrl, // Cloudinary URL từ req.file.path
      description: description.trim(),
      department_id,
      is_active: true
    };

    const consultation = await HealthConsultation.create(consultationData);

    // Populate department name khi trả về
    const populatedConsultation = await HealthConsultation.findById(consultation._id)
      .populate('department_id', 'name');

    res.status(201).json({
      success: true,
      message: 'Tạo tư vấn sức khỏe thành công',
      data: populatedConsultation
    });

  } catch (error) {
    console.error('Create health consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
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
 *         name: department_id
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *     responses:
 *       200:
 *         description: List of health consultations
 */
const getAllHealthConsultations = async (req, res) => {
  try {
    const { department_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Build query - lấy tất cả consultations active
    const query = { is_active: true };
    if (department_id) {
      query.department_id = department_id;
    }

    // Sử dụng pagination utility với populate
    const result = await paginate(HealthConsultation, query, {
      page,
      limit: Math.min(limit, 100),
      sort: { createdAt: -1 },
      populate: [
        { path: 'department_id', select: 'name' } // Chỉ lấy name để tránh tràn data
      ]
    });

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
    const consultation = await HealthConsultation.findById(req.params.id)
      .populate('department_id', 'name description');
    
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tư vấn sức khỏe'
      });
    }

    res.json({
      success: true,
      data: consultation
    });

  } catch (error) {
    console.error('Get health consultation by ID error:', error);
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               department_id:
 *                 type: string
 *               is_active:
 *                 type: boolean
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
    const { id } = req.params;
    const updateData = { ...req.body };

    // Nếu có department_id mới, kiểm tra tồn tại
    if (updateData.department_id) {
      const department = await Department.findById(updateData.department_id);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Khoa không tồn tại'
        });
      }
    }

    const updatedConsultation = await HealthConsultation.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('department_id', 'name');

    if (!updatedConsultation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tư vấn sức khỏe'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật tư vấn sức khỏe thành công',
      data: updatedConsultation
    });

  } catch (error) {
    console.error('Update health consultation error:', error);
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
    const deletedConsultation = await HealthConsultation.findByIdAndDelete(req.params.id);
    
    if (!deletedConsultation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tư vấn sức khỏe'
      });
    }

    res.json({
      success: true,
      message: 'Xóa tư vấn sức khỏe thành công'
    });

  } catch (error) {
    console.error('Delete health consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

export { 
  createHealthConsultation, 
  getAllHealthConsultations, 
  getHealthConsultationById, 
  updateHealthConsultation, 
  deleteHealthConsultation 
};
