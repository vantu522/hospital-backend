import Recruitment from "../../models/recruitment.model.js";
import { generateSlug } from "../../utils/slug.js";
 import fs from 'fs';
import path from 'path';
const recruitmentController = {
  /**
   * @swagger
   * /api/recruitments:
   *   post:
   *     summary: Create a new recruitment post
   *     description: Create a new recruitment post with optional document upload
   *     tags: [Recruitments]
   *     consumes:
   *       - multipart/form-data
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
   *                 example: "Tuyển dụng bác sĩ tim mạch"
   *               position:
   *                 type: string
   *                 description: Position name
   *                 example: "Bác sĩ chuyên khoa"
   *               specialty_id:
   *                 type: string
   *                 format: ObjectId
   *                 description: Specialty ID
   *                 example: "507f1f77bcf86cd799439011"
   *               description:
   *                 type: string
   *                 description: Job description
   *                 example: "Mô tả công việc chi tiết..."
   *               requirements:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Job requirements
   *                 example: ["Tốt nghiệp đại học Y", "Có chứng chỉ hành nghề"]
   *               benefits:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Job benefits
   *                 example: ["Lương cao", "Bảo hiểm y tế"]
   *               deadline:
   *                 type: string
   *                 format: date
   *                 description: Application deadline
   *                 example: "2024-12-31"
   *               location:
   *                 type: string
   *                 description: Work location
   *                 example: "Hà Nội"
   *               contact_email:
   *                 type: string
   *                 format: email
   *                 description: Contact email
   *                 example: "hr@hospital.com"
   *               recruitment_count:
   *                 type: number
   *                 minimum: 1
   *                 description: Number of positions to recruit
   *                 example: 5
   *               expiry_date:
   *                 type: string
   *                 format: date-time
   *                 description: Recruitment post expiry date
   *                 example: "2024-12-31T23:59:59.000Z"
   *               document:
   *                 type: string
   *                 format: binary
   *                 description: Recruitment document (PDF only)
   *     responses:
   *       201:
   *         description: Recruitment created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Recruitment'
   *       400:
   *         description: Bad request
   */
  createRecruitment: async (req, res) => {
    try {
      const documentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

      const recruitmentData = {
        ...req.body,
        slug: generateSlug(req.body.title), // Tạo slug từ tên dịch vụ
        document: documentPath,
      };
      const recruitment = new Recruitment(recruitmentData);
      await recruitment.save();
      res.status(201).json(recruitment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/recruitments:
   *   get:
   *     summary: Get all recruitment posts
   *     description: Retrieve all recruitment posts with optional filtering
   *     tags: [Recruitments]
   *     parameters:
   *       - in: query
   *         name: specialty_id
   *         schema:
   *           type: string
   *           format: ObjectId
   *         description: Filter by specialty ID
   *         example: "507f1f77bcf86cd799439011"
   *       - in: query
   *         name: active_only
   *         schema:
   *           type: boolean
   *         description: Show only active (not expired) recruitments
   *         example: true
   *     responses:
   *       200:
   *         description: List of recruitments retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Recruitment'
   *       500:
   *         description: Internal server error
   */
  getAllRecruitments: async (req, res) => {
    try {
      const recruitments = await Recruitment.find();
      res.json(recruitments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/recruitments/{id}:
   *   get:
   *     summary: Get recruitment by ID
   *     description: Retrieve a specific recruitment post by its ID
   *     tags: [Recruitments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: ObjectId
   *         description: Recruitment ID
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Recruitment retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Recruitment'
   *       404:
   *         description: Recruitment not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Không tìm thấy tin tuyển dụng"
   *       500:
   *         description: Internal server error
   */
  getRecruitmentById: async (req, res) => {
    try {
      const recruitment = await Recruitment.findById(req.params.id);
      if (!recruitment)
        return res
          .status(404)
          .json({ message: "Không tìm thấy tin tuyển dụng" });
      res.json(recruitment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  /**
   * @swagger
   * /api/recruitments/slug/{slug}:
   *   get:
   *     summary: Get recruitment by slug
   *     description: Retrieve a specific recruitment post by its slug
   *     tags: [Recruitments]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *         description: Recruitment slug
   *         example: "tuyen-dung-bac-si-tim-mach"
   *     responses:
   *       200:
   *         description: Recruitment retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Recruitment'
   *       404:
   *         description: Recruitment not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Không tìm thấy tin tuyển dụng"
   *       500:
   *         description: Internal server error
   */
  getRecruitmentBySlug: async (req, res) => {
    try {
      const recruitment = await Recruitment.findOne({ slug: req.params.slug });
      if (!recruitment) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tin tuyển dụng" });
      }
      res.json(recruitment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/recruitments/{id}:
   *   put:
   *     summary: Update a recruitment post
   *     description: Update a recruitment post with optional document upload
   *     tags: [Recruitments]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: ObjectId
   *         description: Recruitment ID
   *         example: "507f1f77bcf86cd799439011"
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: Recruitment title
   *                 example: "Tuyển dụng bác sĩ tim mạch"
   *               position:
   *                 type: string
   *                 description: Position name
   *                 example: "Bác sĩ chuyên khoa"
   *               specialty_id:
   *                 type: string
   *                 format: ObjectId
   *                 description: Specialty ID
   *                 example: "507f1f77bcf86cd799439011"
   *               description:
   *                 type: string
   *                 description: Job description
   *                 example: "Mô tả công việc chi tiết..."
   *               requirements:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Job requirements
   *                 example: ["Tốt nghiệp đại học Y", "Có chứng chỉ hành nghề"]
   *               benefits:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Job benefits
   *                 example: ["Lương cao", "Bảo hiểm y tế"]
   *               deadline:
   *                 type: string
   *                 format: date
   *                 description: Application deadline
   *                 example: "2024-12-31"
   *               location:
   *                 type: string
   *                 description: Work location
   *                 example: "Hà Nội"
   *               contact_email:
   *                 type: string
   *                 format: email
   *                 description: Contact email
   *                 example: "hr@hospital.com"
   *               recruitment_count:
   *                 type: number
   *                 minimum: 1
   *                 description: Number of positions to recruit
   *                 example: 5
   *               expiry_date:
   *                 type: string
   *                 format: date-time
   *                 description: Recruitment post expiry date
   *                 example: "2024-12-31T23:59:59.000Z"
   *               document:
   *                 type: string
   *                 format: binary
   *                 description: Recruitment document (PDF only)
   *     responses:
   *       200:
   *         description: Recruitment updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Recruitment'
   *       400:
   *         description: Bad request
   *       404:
   *         description: Recruitment not found
   */
  updateRecruitment: async (req, res) => {
  try {
    const recruitment = await Recruitment.findById(req.params.id);
    if (!recruitment) return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });

    // Nếu có file mới thì xoá file cũ
    if (req.file) {
      if (recruitment.document) {
        const oldPath = path.resolve(recruitment.document);

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const documentPath = req.file ? req.file.path.replace(/\\/g, "/") : recruitment.document;

    const updatedData = {
      ...req.body,
      document: documentPath,
      updatedAt: new Date(),
    };

    const updated = await Recruitment.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
},


  /**
   * @swagger
   * /api/recruitments/{id}:
   *   delete:
   *     summary: Delete recruitment post
   *     description: Delete a recruitment post (Admin only)
   *     tags: [Recruitments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: ObjectId
   *         description: Recruitment ID
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Recruitment deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Đã xoá tin tuyển dụng"
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin access required
   *       404:
   *         description: Recruitment not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Không tìm thấy tin tuyển dụng"
   *       500:
   *         description: Internal server error
   */
  deleteRecruitment: async (req, res) => {
  try {
    const recruitment = await Recruitment.findById(req.params.id);
    if (!recruitment)
      return res.status(404).json({ message: "Không tìm thấy tin tuyển dụng" });

    // Xoá file document nếu có
    if (recruitment.document) {
    const filePath = path.resolve(recruitment.document);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Xoá dữ liệu trong MongoDB
    await Recruitment.findByIdAndDelete(req.params.id);

    res.json({ message: "Đã xoá tin tuyển dụng và tài liệu đính kèm" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},

};

export default recruitmentController;
