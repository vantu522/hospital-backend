import contactService from '../services/contact.service.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - full_name
 *         - phone_number
 *         - email
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: Contact ID
 *         full_name:
 *           type: string
 *           description: Full name of the person
 *         phone_number:
 *           type: string
 *           description: Phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         message:
 *           type: string
 *           description: Contact message
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Create a new contact message
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - phone_number
 *               - email
 *               - message
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Full name
 *               phone_number:
 *                 type: string
 *                 description: Phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               message:
 *                 type: string
 *                 description: Contact message
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       400:
 *         description: Bad request
 */
export const createContact = async (req, res) => {
  try {
    const result = await contactService.createContact(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by phone
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: List of contacts
 *       500:
 *         description: Server error
 */
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts(req.query);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Get contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact details
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
export const getContactById = async (req, res) => {
  try {
    const contact = await contactService.getContactById(req.params.id);
    res.json(contact);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/contacts/{id}:
 *   put:
 *     summary: Update contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       404:
 *         description: Contact not found
 *       400:
 *         description: Bad request
 */
export const updateContact = async (req, res) => {
  try {
    const result = await contactService.updateContact(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(statusCode).json({ error: err.message });
  }   
}

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Delete contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
export const deleteContact = async (req, res) => {
  try {
    const result = await contactService.deleteContact(req.params.id);
    res.json(result);
  } catch (err) {
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : 500;
    res.status(statusCode).json({ error: err.message });
  }
}