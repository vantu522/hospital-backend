/**
 * @swagger
 * tags:
 *   name: Background Banners
 *   description: Background banner management API
 */

import BackgroundBanner from "../../models/background-banner.model.js";
import { cloudinary, getPublicId } from "../../config/cloudinary.js";

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
    const imageFile = req.files?.image?.[0];
    
    if (!imageFile) {
      return res.status(400).json({ error: "Vui lòng upload ảnh banner" });
    }

    const bannerData = {
      ...req.body,
      image: imageFile.path, // URL từ Cloudinary
    };

    const banner = new BackgroundBanner(bannerData);
    await banner.save();
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
    const banners = await BackgroundBanner.find();
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
    const banner = await BackgroundBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const banner = await BackgroundBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }

    const imageFile = req.files?.image?.[0];
    const updatedData = { ...req.body };

    // Nếu có ảnh mới, xóa ảnh cũ và cập nhật ảnh mới
    if (imageFile) {
      if (banner.image) {
        const publicId = getPublicId(banner.image);
        await cloudinary.uploader.destroy(publicId);
      }
      updatedData.image = imageFile.path;
    }

    const updated = await BackgroundBanner.findByIdAndUpdate(
      req.params.id, 
      updatedData, 
      { new: true }
    );
    
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    const banner = await BackgroundBanner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }

    // Xóa ảnh trên Cloudinary
    if (banner.image) {
      const publicId = getPublicId(banner.image);
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ message: "Đã xóa banner thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
