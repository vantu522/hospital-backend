import { cloudinary, getPublicId } from '../../config/cloudinary.js';
import Specialty from '../../models/specialty.model.js';
import { generateSlug } from '../../utils/slug.js';
import Doctor from '../../models/doctor.model.js';

/**
 * @swagger
 * /api/specialties:
 *   post:
 *     summary: Create a new specialty (Admin only)
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Specialty name
 *               description:
 *                 type: string
 *                 description: Specialty description
 *               functions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specialty functions
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Specialty images
 *     responses:
 *       201:
 *         description: Specialty created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const createSpecialty = async (req, res) => {
  try {
    const { name, description, functions } = req.body;

    // Validation - Kiểm tra field bắt buộc
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên chuyên khoa là bắt buộc'
      });
    }

    const specialtyData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      functions: Array.isArray(functions) ? functions : (functions ? functions.split(',').map(f => f.trim()) : []),
      slug: generateSlug(name),
      images: req.files?.images ? req.files.images.map(file => file.path) : [],
      is_active: true
    };

    const specialty = await Specialty.create(specialtyData);

    res.status(201).json({
      success: true,
      message: 'Tạo chuyên khoa thành công',
      data: specialty
    });

  } catch (error) {
    console.error('Create specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/specialties:
 *   get:
 *     summary: Get all specialties
 *     tags: [Specialties]
 *     responses:
 *       200:
 *         description: List of specialties
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       functions:
 *                         type: array
 *                         items:
 *                           type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       slug:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 */
const getAllSpecialties = async (req, res) => {
  try {
    // Lấy tất cả specialties không điều kiện
    const specialties = await Specialty.find({})
      .select('name description functions images slug is_active') // Chỉ lấy các field cần thiết
      .sort({ name: 1 }); // Sắp xếp theo tên A-Z

    res.json({
      success: true,
      data: specialties
    });

  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/specialties/slug/{slug}:
 *   get:
 *     summary: Get specialty by slug
 *     tags: [Specialties]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialty slug
 *     responses:
 *       200:
 *         description: Specialty details
 *       404:
 *         description: Specialty not found
 */
const getSpecialtyBySlug = async (req, res) => {
  try {
    const specialty = await Specialty.findOne({ slug: req.params.slug });
    
    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chuyên khoa'
      });
    }

    res.json({
      success: true,
      data: specialty
    });

  } catch (error) {
    console.error('Get specialty by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/specialties/{id}:
 *   put:
 *     summary: Update specialty (Admin only)
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialty ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               functions:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_active:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Specialty updated successfully
 *       404:
 *         description: Specialty not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const updateSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.findById(req.params.id);
    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chuyên khoa'
      });
    }

    const imageFiles = req.files?.images || [];
    const updateData = {};

    // Chỉ thêm các field có trong request
    if (req.body.name !== undefined) {
      updateData.name = req.body.name.trim();
      updateData.slug = generateSlug(req.body.name); // Tự động tạo slug khi có name
    }

    if (req.body.description !== undefined) {
      updateData.description = req.body.description.trim();
    }

    if (req.body.functions !== undefined) {
      updateData.functions = Array.isArray(req.body.functions) ? 
        req.body.functions : 
        req.body.functions.split(',').map(f => f.trim());
    }

    if (req.body.is_active !== undefined) {
      updateData.is_active = req.body.is_active;
    }

    // Nếu có ảnh mới -> xóa ảnh cũ trước
    if (imageFiles.length > 0) {
      if (Array.isArray(specialty.images)) {
        for (const img of specialty.images) {
          const publicId = getPublicId(img);
          await cloudinary.uploader.destroy(publicId);
        }
      }
      // Cập nhật ảnh mới
      updateData.images = imageFiles.map((file) => file.path);
    }

    const updatedSpecialty = await Specialty.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật chuyên khoa thành công',
      data: updatedSpecialty
    });

  } catch (error) {
    console.error('Update specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/specialties/{id}:
 *   delete:
 *     summary: Delete specialty (Admin only)
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialty ID
 *     responses:
 *       200:
 *         description: Specialty deleted successfully
 *       404:
 *         description: Specialty not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       400:
 *         description: Cannot delete specialty with existing consultations
 */
const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra specialty có tồn tại không
    const specialty = await Specialty.findById(id);
    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chuyên khoa'
      });
    }

    // Kiểm tra xem có health consultation nào đang sử dụng specialty này không
    const { default: HealthConsultation } = await import('../../models/health-consultation.model.js');
    const existingConsultations = await HealthConsultation.findOne({ 
      specialty_id: id,
      is_active: true 
    });

    if (existingConsultations) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa chuyên khoa này vì đang có tư vấn sức khỏe liên quan'
      });
    }

    // Xóa ảnh trên Cloudinary trước
    if (Array.isArray(specialty.images)) {
      for (const img of specialty.images) {
        const publicId = getPublicId(img);
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await Specialty.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Xóa chuyên khoa thành công'
    });

  } catch (error) {
    console.error('Delete specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

export const getSpecialtyWithDoctors = async (req, res) => {
    try {
        const { id } = req.params;
        
        const specialty = await Specialty.findById(id);
        if (!specialty) return res.status(404).json({ message: "Specialty not found" });

        const doctors = await Doctor.find({ specialties: id }).select('full_name slug avatar');

        res.json({
            specialty,
            doctors,
            doctorCount: doctors.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export { createSpecialty, getAllSpecialties, getSpecialtyBySlug, updateSpecialty, deleteSpecialty };