
import customerService from '../services/customer.service.js';

/**
 * @swagger
 * /api/customer/register:
 *   post:
 *     summary: Đăng ký tài khoản khách hàng
 *     tags:
 *       - Customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - phone_number
 *               - citizen_id
 *               - date_of_birth
 *               - gender
 *               - address
 *               - health_insurance_number
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               citizen_id:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               address:
 *                 type: string
 *               health_insurance_number:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Đăng ký thất bại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const register = async (req, res) => {
  try {
    const result = await customerService.register(req.body);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: result
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/customer/login:
 *   post:
 *     summary: Đăng nhập khách hàng
 *     tags:
 *       - Customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email hoặc số điện thoại
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Đăng nhập thất bại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const result = await customerService.login(identifier, password);
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default {
  register,
  login
};
