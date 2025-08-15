import introduceService from '../services/introduce.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Introduce:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: Introduce ID
 *         title:
 *           type: string
 *           description: Introduction title
 *         slug:
 *           type: string
 *           description: URL slug
 *         description:
 *           type: string
 *           description: Introduction description
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Introduction images
 *         is_active:
 *           type: boolean
 *           description: Active status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const introduceController = {
  /**
   * @swagger
   * /api/introduces:
   *   post:
   *     summary: Create a new introduction (Admin only)
   *     tags: [Introduces]
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
   *             properties:
   *               title:
   *                 type: string
   *                 description: Introduction title
   *               description:
   *                 type: string
   *                 description: Introduction description
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: Introduction images
   *     responses:
   *       201:
   *         description: Introduction created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin only
   */
  createIntroduce: async (req, res) => {
    try {
      const result = await introduceService.createIntroduce(req.body, req.files);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/introduces:
   *   get:
   *     summary: Get all introductions
   *     tags: [Introduces]
   *     parameters:
   *       - in: query
   *         name: is_active
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *     responses:
   *       200:
   *         description: List of introductions
   *       500:
   *         description: Server error
   */
  getAllIntroduces: async (req, res) => {
    try {
      const introduces = await introduceService.getAllIntroduces(req.query);
      res.json(introduces);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/introduces/{id}:
   *   get:
   *     summary: Get introduction by ID
   *     tags: [Introduces]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Introduction ID
   *     responses:
   *       200:
   *         description: Introduction details
   *       404:
   *         description: Introduction not found
   *       500:
   *         description: Server error
   */
  getIntroduceById: async (req, res) => {
    try {
      const introduce = await introduceService.getIntroduceById(req.params.id);
      res.json(introduce);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/introduces/slug/{slug}:
   *   get:
   *     summary: Get introduction by slug
   *     tags: [Introduces]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *         description: Introduction slug
   *     responses:
   *       200:
   *         description: Introduction details
   *       404:
   *         description: Introduction not found
   *       500:
   *         description: Server error
   */
  getIntroduceBySlug: async (req, res) => {
    try {
      const introduce = await introduceService.getIntroduceBySlug(req.params.slug);
      res.json(introduce);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/introduces/{id}:
   *   put:
   *     summary: Update introduction by ID (Admin only)
   *     tags: [Introduces]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Introduction ID
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               is_active:
   *                 type: boolean
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: Introduction updated successfully
   *       404:
   *         description: Introduction not found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin only
   */
  updateIntroduce: async (req, res) => {
    try {
      const result = await introduceService.updateIntroduce(req.params.id, req.body, req.files);
      res.json(result);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 400;
      res.status(statusCode).json({ error: err.message });
    }
  },

  /**
   * @swagger
   * /api/introduces/{id}:
   *   delete:
   *     summary: Delete introduction by ID (Admin only)
   *     tags: [Introduces]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Introduction ID
   *     responses:
   *       200:
   *         description: Introduction deleted successfully
   *       404:
   *         description: Introduction not found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin only
   */
  deleteIntroduce: async (req, res) => {
    try {
      const result = await introduceService.deleteIntroduce(req.params.id);
      res.json(result);
    } catch (err) {
      const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  }
};

export default introduceController;