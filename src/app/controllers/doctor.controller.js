import doctorService from '../services/doctor.service.js';

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create a new doctor (Admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - specialties
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Doctor's full name
 *               specialties:
 *                 type: string
 *                 description: Doctor's specialties
 *               hospital:
 *                 type: string
 *                 description: Hospital name
 *               department:
 *                 type: string
 *                 description: Department
 *               degree:
 *                 type: string
 *                 description: Medical degree
 *               description:
 *                 type: string
 *                 description: Doctor description
 *               phone_number:
 *                 type: string
 *                 description: Phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               work_address:
 *                 type: string
 *                 description: Work address
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Doctor's avatar
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const createDoctor = async (req, res) => {
  try {
    const result = await doctorService.createDoctor(req.body, req.files);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors with pagination
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: specialties
 *         schema:
 *           type: string
 *         description: Filter by specialties
 *       - in: query
 *         name: hospital
 *         schema:
 *           type: string
 *         description: Filter by hospital
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by doctor name or specialties
 *     responses:
 *       200:
 *         description: Paginated list of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       500:
 *         description: Server error
 */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors(req.query);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/doctors/slug/{slug}:
 *   get:
 *     summary: Get doctor by slug
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor slug
 *     responses:
 *       200:
 *         description: Doctor details
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
export const getDoctorBySlug = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorBySlug(req.params.slug);
    res.json(doctor);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Update doctor by ID (Admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               specialties:
 *                 type: string
 *               hospital:
 *                 type: string
 *               department:
 *                 type: string
 *               degree:
 *                 type: string
 *               description:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               work_address:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       404:
 *         description: Doctor not found
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const updateDoctor = async (req, res) => {
  try {
    const result = await doctorService.updateDoctor(req.params.id, req.body, req.files);
    res.json(result);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Delete doctor by ID (Admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       404:
 *         description: Doctor not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const deleteDoctor = async (req, res) => {
  try {
    const result = await doctorService.deleteDoctor(req.params.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/doctors/specialty/{specialtyId}:
 *   get:
 *     summary: Get doctors by specialty
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: specialtyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialty ID
 *     responses:
 *       200:
 *         description: List of doctors by specialty
 *       404:
 *         description: No doctors found for this specialty
 *       500:
 *         description: Server error
 */
export const getDoctorsBySpecialty = async (req, res) => {
  try {
    const result = await doctorService.getDoctorsBySpecialty(req.params.specialtyId);
    res.json(result);
  } catch (error) {
    const statusCode = error.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/doctors/random/five:
 *   get:
 *     summary: Get five random doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of random doctors
 *       500:
 *         description: Server error
 */
export const getFiveRandomDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getRandomDoctors(5);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


