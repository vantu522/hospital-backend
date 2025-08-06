import HealthConsultation from '../../models/health-consultation.model.js';
import Specialty from '../../models/specialty.model.js';
import { paginate } from '../../utils/pagination.js';
import { generateSlug } from '../../utils/slug.js';

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
    const { title, description, specialty_id } = req.body;
    // Cloudinary sẽ trả về url trong req.file.path
    const imageUrl = req.file?.path || '';

    // Validation - Kiểm tra tất cả field bắt buộc
    if (!title || !description || !specialty_id) {
      return res.status(400).json({
        success: false,
        message: 'Tất cả các trường đều bắt buộc: title, description, specialty_id'
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Ảnh là bắt buộc'
      });
    }

    // Kiểm tra specialty có tồn tại không
    const specialty = await Specialty.findById(specialty_id);
    if (!specialty) {
      return res.status(400).json({
        success: false,
        message: 'Chuyên khoa không tồn tại'
      });
    }

    // Generate slug từ title
    const slug = generateSlug(title);

    // Kiểm tra slug đã tồn tại chưa
    const existingConsultation = await HealthConsultation.findOne({ slug });
    if (existingConsultation) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề này đã tồn tại, vui lòng chọn tiêu đề khác'
      });
    }

    const consultationData = {
      title: title.trim(),
      slug,
      image: imageUrl, // Cloudinary URL từ req.file.path
      description: description.trim(),
      specialty_id,
      is_active: true
    };

    const consultation = await HealthConsultation.create(consultationData);

    // Populate specialty name khi trả về
    const populatedConsultation = await HealthConsultation.findById(consultation._id)
      .populate('specialty_id', 'name');

    res.status(201).json({
      success: true,
      message: 'Tạo tư vấn sức khỏe thành công',
      data: populatedConsultation
    });

  } catch (error) {
    console.error('Create health consultation error:', error);
    
    // Xử lý lỗi duplicate slug
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề này đã tồn tại, vui lòng chọn tiêu đề khác'
      });
    }

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
    const { specialty_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Build query - lấy tất cả consultations active
    const query = { is_active: true };
    if (specialty_id) {
      query.specialty_id = specialty_id;
    }

    // Sử dụng pagination utility với populate
    const result = await paginate(HealthConsultation, query, {
      page,
      limit: Math.min(limit, 100),
      sort: { createdAt: -1 },
      populate: [
        { path: 'specialty_id', select: 'name' } // Chỉ lấy name để tránh tràn data
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
      .populate('specialty_id', 'name description');
    
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
    const { id } = req.params;
    
    console.log('Update health consultation request - ID:', id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? {
      filename: req.file.filename,
      path: req.file.path,
      originalname: req.file.originalname
    } : 'No file uploaded');

    // Tìm consultation hiện tại
    const currentConsultation = await HealthConsultation.findById(id);
    if (!currentConsultation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tư vấn sức khỏe'
      });
    }

    const updateData = { ...req.body };

    // Parse specialty_id nếu có (fix lỗi [object Object])
    if (updateData.specialty_id) {
      console.log('Original specialty_id type:', typeof updateData.specialty_id);
      console.log('Original specialty_id value:', updateData.specialty_id);
      
      if (typeof updateData.specialty_id === 'object') {
        // Nếu là object, lấy _id hoặc id
        updateData.specialty_id = updateData.specialty_id._id || updateData.specialty_id.id || updateData.specialty_id;
      }
      
      // Nếu vẫn là object hoặc [object Object], thử stringify và parse
      if (typeof updateData.specialty_id === 'object' || updateData.specialty_id === '[object Object]') {
        console.log('Still object, trying to extract ID...');
        // Có thể frontend gửi object với cấu trúc khác
        if (updateData.specialty_id && updateData.specialty_id.toString) {
          updateData.specialty_id = updateData.specialty_id.toString();
        }
        
        // Nếu vẫn là [object Object], skip validation này
        if (updateData.specialty_id === '[object Object]') {
          console.log('Cannot parse specialty_id, removing from update data');
          delete updateData.specialty_id;
        }
      } else {
        // Đảm bảo specialty_id là string hợp lệ
        updateData.specialty_id = String(updateData.specialty_id);
      }
      
      console.log('Final parsed specialty_id:', updateData.specialty_id);
    }

    // Parse is_active nếu có (convert string to boolean)
    if (updateData.is_active !== undefined) {
      if (typeof updateData.is_active === 'string') {
        updateData.is_active = updateData.is_active === 'true';
      }
    }

    // Xử lý title và slug nếu có
    if (updateData.title && updateData.title.trim() !== '') {
      updateData.title = updateData.title.trim();
      const newSlug = generateSlug(updateData.title);
      
      // Kiểm tra slug mới có trung với consultation khác không (trừ chính nó)
      if (newSlug !== currentConsultation.slug) {
        const existingConsultation = await HealthConsultation.findOne({ 
          slug: newSlug, 
          _id: { $ne: id } 
        });
        
        if (existingConsultation) {
          return res.status(400).json({
            success: false,
            message: 'Tiêu đề này đã tồn tại, vui lòng chọn tiêu đề khác'
          });
        }
      }
      
      updateData.slug = newSlug;
    }

    // Kiểm tra specialty_id nếu có và hợp lệ
    if (updateData.specialty_id) {
      // Kiểm tra format ObjectId hợp lệ (24 ký tự hex)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(updateData.specialty_id)) {
        return res.status(400).json({
          success: false,
          message: 'specialty_id không hợp lệ'
        });
      }
      
      const specialty = await Specialty.findById(updateData.specialty_id);
      if (!specialty) {
        return res.status(400).json({
          success: false,
          message: 'Chuyên khoa không tồn tại'
        });
      }
    }

    // Xử lý ảnh mới nếu có
    if (req.file) {
      updateData.image = req.file.path; // Cloudinary URL
      console.log('New image path:', req.file.path);
    }

    updateData.updatedAt = new Date();

    console.log('Final update data:', updateData);

    const updatedConsultation = await HealthConsultation.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('specialty_id', 'name');

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
    
    // Xử lý lỗi duplicate slug
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề này đã tồn tại, vui lòng chọn tiêu đề khác'
      });
    }

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
    const consultation = await HealthConsultation.findOne({ 
      slug: req.params.slug,
      is_active: true 
    }).populate('specialty_id', 'name description');
    
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
    console.error('Get health consultation by slug error:', error);
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
  getHealthConsultationBySlug,
  updateHealthConsultation, 
  deleteHealthConsultation 
};
