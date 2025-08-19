import customerService from '../services/customer.service.js';

/**
 * @swagger
 * /api/customers/register:
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
 *               - phone_number
 *               - password
 *             properties:
 *               phone_number:
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
  console.log('---[API] /api/customers/register: Bắt đầu xử lý request');
  try {
    console.log('Request body:', req.body);
    const result = await customerService.register(req.body);
    console.log('Kết quả trả về từ service:', result);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: result
    });
  } catch (error) {
    console.error('Lỗi khi register customer:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/customers/login:
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
 *               - phone_number
 *               - password
 *             properties:
 *               phone_number:
 *                 type: string
 *                 description: Số điện thoại
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
    const { phone_number, password } = req.body;
    const result = await customerService.login(phone_number, password);
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/customers:
 *   put:
 *     summary: Cập nhật thông tin khách hàng
 *     tags:
 *       - Customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
 *         description: Cập nhật thất bại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const update = async (req, res) => {
  try {
    const customerId = req.userId;
    const result = await customerService.update(customerId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: result
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default {
  register,
  login,
  update
};
