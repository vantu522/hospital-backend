import serviceService from '../services/service.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - name
 *         - specialties
 *       properties:
 *         _id:
 *           type: string
 *           description: Service ID
 *         name:
 *           type: string
 *           description: Service name
 *         specialties:
 *           type: string
 *           description: Related specialties
 *         description:
 *           type: string
 *           description: Service description
 *         slug:
 *           type: string
 *           description: URL slug
 *         avatar:
 *           type: string
 *           description: Service avatar URL
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Service images
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Service features
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

class ServiceController {
  /**
   * @swagger
   * /api/services:
   *   post:
   *     summary: Create a new service (Admin only)
   *     tags: [Services]
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
   *               - specialties
   *             properties:
   *               name:
   *                 type: string
   *                 description: Service name
   *               specialties:
   *                 type: string
   *                 description: Related specialties
   *               description:
   *                 type: string
   *                 description: Service description
   *               features:
   *                 type: string
   *                 description: Comma-separated features
   *               avatar:
   *                 type: string
   *                 format: binary
   *                 description: Service avatar
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: Service images
   *     responses:
   *       201:
   *         description: Service created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin only
   */
  async createService(req, res) {
    try {
      const result = await serviceService.createService(req.body, req.files);
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * @swagger
   * /api/services:
   *   get:
   *     summary: Get all services
   *     tags: [Services]
   *     parameters:
   *       - in: query
   *         name: specialties
   *         schema:
   *           type: string
   *         description: Filter by specialties
   *       - in: query
   *         name: is_active
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *     responses:
   *       200:
   *         description: List of services
   *       500:
   *         description: Server error
   */
  async getAllServices(req, res) {
    try {
      const services = await serviceService.getAllServices(req.query);
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * @swagger
   * /api/services/slug/{slug}:
   *   get:
   *     summary: Get service by slug
   *     tags: [Services]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *         description: Service slug
   *     responses:
   *       200:
   *         description: Service details
   *       404:
   *         description: Service not found
   *       500:
   *         description: Server error
   */
  async getServiceBySlug(req, res) {
    try {
      const service = await serviceService.getServiceBySlug(req.params.slug);
      res.status(200).json(service);
    } catch (error) {
      const statusCode = error.message.includes('not found') || error.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  /**
   * @swagger
   * /api/services/{id}:
   *   put:
   *     summary: Update service by ID (Admin only)
   *     tags: [Services]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Service ID
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               specialties:
   *                 type: string
   *               description:
   *                 type: string
   *               features:
   *                 type: string
   *               is_active:
   *                 type: boolean
   *               avatar:
   *                 type: string
   *                 format: binary
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: Service updated successfully
   *       404:
   *         description: Service not found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin only
   */
async updateService(req, res) {
  try {
    const result = await serviceService.updateService(req.params.id, req.body, req.files);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const statusCode = error.message.includes('not found') || error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
}

  /**
   * @swagger
   * /api/services/{id}:
   *   delete:
   *     summary: Delete service by ID (Admin only)
   *     tags: [Services]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Service ID
   *     responses:
   *       204:
   *         description: Service deleted successfully
   *       404:
   *         description: Service not found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Admin only
   */
  async deleteService(req, res) {
    try {
      const result = await serviceService.deleteService(req.params.id);
      res.status(204).send();
    } catch (error) {
      const statusCode = error.message.includes('not found') || error.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  /**
   * @swagger
   * /api/services/specialty/{specialtyId}:
   *   get:
   *     summary: Get services by specialty
   *     tags: [Services]
   *     parameters:
   *       - in: path
   *         name: specialtyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Specialty ID
   *     responses:
   *       200:
   *         description: List of services by specialty
   *       404:
   *         description: No services found for this specialty
   *       500:
   *         description: Server error
   */
  async getServicesBySpecialty(req, res) {
    try {
      const result = await serviceService.getServicesBySpecialty(req.params.specialtyId);
      res.json(result);
    } catch (error) {
      const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
}

export default new ServiceController();
