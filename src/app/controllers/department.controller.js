import Department from '../../models/department.model.js';

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department (Admin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *               description:
 *                 type: string
 *                 description: Department description
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation - Kiểm tra field bắt buộc
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên khoa là bắt buộc'
      });
    }

    const departmentData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      is_active: true
    };

    const department = await Department.create(departmentData);

    res.status(201).json({
      success: true,
      message: 'Tạo khoa thành công',
      data: department
    });

  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of departments
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
 *                       is_active:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 */
const getAllDepartments = async (req, res) => {
  try {
    // Lấy tất cả departments không điều kiện
    const departments = await Department.find({})
      .select('name description is_active') // Chỉ lấy các field cần thiết
      .sort({ name: 1 }); // Sắp xếp theo tên A-Z

    res.json({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete department (Admin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       400:
 *         description: Cannot delete department with existing consultations
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra department có tồn tại không
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoa'
      });
    }

    // Kiểm tra xem có health consultation nào đang sử dụng department này không
    const { default: HealthConsultation } = await import('../../models/health-consultation.model.js');
    const existingConsultations = await HealthConsultation.findOne({ 
      department_id: id,
      is_active: true 
    });

    if (existingConsultations) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa khoa này vì đang có tư vấn sức khỏe liên quan'
      });
    }

    await Department.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Xóa khoa thành công'
    });

  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

export { createDepartment, getAllDepartments, deleteDepartment };
