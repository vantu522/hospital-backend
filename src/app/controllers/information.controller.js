import informationService from '../services/information.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Information:
 *       type: object
 *       required:
 *         - hospital_name
 *         - address
 *         - phone_number
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: Information ID
 *         hospital_name:
 *           type: string
 *           description: Hospital name
 *         address:
 *           type: string
 *           description: Hospital address
 *         phone_number:
 *           type: string
 *           description: Hospital phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Hospital email
 *         website:
 *           type: string
 *           description: Hospital website
 *         facebook_url:
 *           type: string
 *           description: Facebook page URL
 *         youtube_url:
 *           type: string
 *           description: YouTube channel URL
 *         working_hours:
 *           type: string
 *           description: Working hours
 *         emergency_number:
 *           type: string
 *           description: Emergency contact number
 *         description:
 *           type: string
 *           description: Hospital description
 *         is_main:
 *           type: boolean
 *           description: Is main information
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/informations:
 *   post:
 *     summary: Create or update hospital information (Admin only)
 *     tags: [Information]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hospital_name
 *               - address
 *               - phone_number
 *               - email
 *             properties:
 *               hospital_name:
 *                 type: string
 *                 description: Hospital name
 *               address:
 *                 type: string
 *                 description: Hospital address
 *               phone_number:
 *                 type: string
 *                 description: Hospital phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Hospital email
 *               website:
 *                 type: string
 *                 description: Hospital website
 *               facebook_url:
 *                 type: string
 *                 description: Facebook page URL
 *               youtube_url:
 *                 type: string
 *                 description: YouTube channel URL
 *               working_hours:
 *                 type: string
 *                 description: Working hours
 *               emergency_number:
 *                 type: string
 *                 description: Emergency contact number
 *               description:
 *                 type: string
 *                 description: Hospital description
 *     responses:
 *       201:
 *         description: Information created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const createInformation = async (req, res) => {
  try {
    const result = await informationService.createOrUpdateInformation(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/informations:
 *   get:
 *     summary: Get all hospital information
 *     tags: [Information]
 *     responses:
 *       200:
 *         description: List of hospital information
 *       500:
 *         description: Server error
 */
export const getAllInformation = async (req, res) => {
  try {
    const information = await informationService.getAllInformation();
    res.json(information);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/information/main:
 *   get:
 *     summary: Get main hospital information
 *     tags: [Information]
 *     responses:
 *       200:
 *         description: Main hospital information
 *       500:
 *         description: Server error
 */
export const getMainInformation = async (req, res) => {
  try {
    const information = await informationService.getMainInformation();
    res.json(information);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/informations/{id}:
 *   put:
 *     summary: Update hospital information by ID (Admin only)
 *     tags: [Information]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Information ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hospital_name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               website:
 *                 type: string
 *               facebook_url:
 *                 type: string
 *               youtube_url:
 *                 type: string
 *               working_hours:
 *                 type: string
 *               emergency_number:
 *                 type: string
 *               description:
 *                 type: string
 *               is_main:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Information updated successfully
 *       404:
 *         description: Information not found
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const updateInformation = async (req, res) => {
  try {
    const result = await informationService.updateInformation(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/informations/{id}:
 *   delete:
 *     summary: Delete hospital information by ID (Admin only)
 *     tags: [Information]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Information ID
 *     responses:
 *       200:
 *         description: Information deleted successfully
 *       404:
 *         description: Information not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const deleteInformation = async (req, res) => {
  try {
    const result = await informationService.deleteInformation(req.params.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
}