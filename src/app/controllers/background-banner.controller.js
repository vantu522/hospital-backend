/**
 * @swagger
 * tags:
 *   name: Background Banners
 *   description: Background banner management API
 */

import backgroundBannerService from '../services/background-banner.service.js';

/**
 * @swagger
 * /api/background-banners:
 *   post:
 *     summary: Create a new background banner
 *     tags: [Background Banners]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - description
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Banner image file
 *               description:
 *                 type: string
 *                 description: Banner description
 *     responses:
 *       201:
 *         description: Background banner created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BackgroundBanner'
 *       400:
 *         description: Bad request - Missing image or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const createBackgroundBanner = async (req, res) => {
  try {
    const banner = await backgroundBannerService.createBackgroundBanner(req.body, req.files);
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/background-banners:
 *   get:
 *     summary: Get all background banners
 *     tags: [Background Banners]
 *     responses:
 *       200:
 *         description: List of all background banners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BackgroundBanner'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getAllBackgroundBanners = async (req, res) => {
  try {
    const banners = await backgroundBannerService.getAllBackgroundBanners();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/background-banners/{id}:
 *   get:
 *     summary: Get background banner by ID
 *     tags: [Background Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Background banner ID
 *     responses:
 *       200:
 *         description: Background banner details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BackgroundBanner'
 *       404:
 *         description: Background banner not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getBackgroundBannerById = async (req, res) => {
  try {
    const banner = await backgroundBannerService.getBackgroundBannerById(req.params.id);
    res.json(banner);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/background-banners/{id}:
 *   put:
 *     summary: Update background banner
 *     tags: [Background Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Background banner ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New banner image file (optional)
 *               description:
 *                 type: string
 *                 description: New banner description (optional)
 *     responses:
 *       200:
 *         description: Background banner updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BackgroundBanner'
 *       404:
 *         description: Background banner not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const updateBackgroundBanner = async (req, res) => {
  try {
    const updated = await backgroundBannerService.updateBackgroundBanner(
      req.params.id, 
      req.body, 
      req.files
    );
    res.json(updated);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/background-banners/{id}:
 *   delete:
 *     summary: Delete background banner
 *     tags: [Background Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Background banner ID
 *     responses:
 *       200:
 *         description: Background banner deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã xóa banner thành công"
 *       404:
 *         description: Background banner not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const deleteBackgroundBanner = async (req, res) => {
  try {
    const result = await backgroundBannerService.deleteBackgroundBanner(req.params.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
};
