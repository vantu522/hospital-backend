import specialtyService from '../services/specialty.service.js';

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
    const specialty = await specialtyService.createSpecialty(req.body, req.files);

    res.status(201).json({
      success: true,
      message: 'Tạo chuyên khoa thành công',
      data: specialty
    });

  } catch (error) {
    console.error('Create specialty error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi tạo chuyên khoa'
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
    const specialties = await specialtyService.getAllSpecialties();

    res.json({
      success: true,
      data: specialties
    });

  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
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
    const specialty = await specialtyService.getSpecialtyBySlug(req.params.slug);

    res.json({
      success: true,
      data: specialty
    });

  } catch (error) {
    console.error('Get specialty by slug error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy chuyên khoa'
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
    const updatedSpecialty = await specialtyService.updateSpecialty(
      req.params.id, 
      req.body, 
      req.files
    );

    res.json({
      success: true,
      message: 'Cập nhật chuyên khoa thành công',
      data: updatedSpecialty
    });

  } catch (error) {
    console.error('Update specialty error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Lỗi cập nhật chuyên khoa'
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
    const result = await specialtyService.deleteSpecialty(req.params.id);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Delete specialty error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Lỗi xóa chuyên khoa'
    });
  }
};

export const getSpecialtyWithDoctors = async (req, res) => {
  try {
    const result = await specialtyService.getSpecialtyWithDoctors(req.params.id);

    res.json(result);
  } catch (error) {
    console.error('Get specialty with doctors error:', error);
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({
      message: error.message || 'Lỗi server'
    });
  }
};


export { createSpecialty, getAllSpecialties, getSpecialtyBySlug, updateSpecialty, deleteSpecialty };