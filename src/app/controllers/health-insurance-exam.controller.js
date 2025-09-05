import healthInsuranceExamService from '../services/health-insurance-exam.service.js';

/**
 * @swagger
 * /api/health-insurance-exams/check-bhyt-date:
 *   post:
 *     summary: Kiểm tra thông tin thẻ BHYT qua API quốc gia
 *     tags:
 *       - HealthInsuranceExam
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - maThe
 *               - hoTen
 *               - ngaySinh
 *             properties:
 *               maThe:
 *                 type: string
 *                 description: Mã thẻ BHYT
 *               hoTen:
 *                 type: string
 *                 description: Họ tên người khám
 *               ngaySinh:
 *                 type: string
 *                 description: "Ngày sinh (dd/mm/yyyy, ví dụ 25/08/1990)"
 *           example:
 *             maThe: "DN1234567890123"
 *             hoTen: "Nguyen Van A"
 *             ngaySinh: "25/08/1990"
 *     responses:
 *       200:
 *         description: Thông tin thẻ BHYT hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Thông tin trả về từ API quốc gia
 *       400:
 *         description: Thông tin thẻ BHYT không hợp lệ hoặc lỗi xác thực
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

// ...existing code...
const checkBHYTCard = async (req, res) => {
  try {
    const { maThe, hoTen, ngaySinh } = req.body;
    if (!maThe || !hoTen || !ngaySinh) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin thẻ BHYT' });
    }
    const result = await healthInsuranceExamService.checkBHYTCard({ maThe, hoTen, ngaySinh });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


/**
 * @swagger
 * /api/health-insurance-exams/book:
 *   post:
 *     summary: Đặt lịch khám bảo hiểm y tế
 *     tags:
 *       - HealthInsuranceExam
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - citizen_id
 *               - date_of_birth
 *               - gender
 *               - address
 *               - clinicRoom
 *               - exam_type
 *               - exam_date
 *               - exam_time
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
*                 enum: [Nam, Nữ, Khác]
 *               address:
 *                 type: string
 *               health_insurance_number:
 *                 type: string
 *               clinicRoom:
 *                 type: string
 *                 description: ObjectId của phòng khám (ClinicRoom)
 *               exam_type:
 *                 type: string
 *                 enum: [BHYT, DV]
 *                 description: Loại hình khám
 *               exam_date:
 *                 type: string
 *                 format: date
 *               exam_time:
 *                 type: string
 *               symptoms:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đặt lịch khám thành công
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
 *                   $ref: '#/components/schemas/HealthInsuranceExam'
 *       400:
 *         description: Đặt lịch khám thất bại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const createExam = async (req, res) => {
  try {
    // Logic check BHYT dựa trên role
    const { exam_type, health_insurance_number, full_name, date_of_birth } = req.body;
    
    // Chỉ call API BHYT nếu:
    // 1. Role là 'user' (không phải receptionist)
    // 2. exam_type là 'BHYT' (không phải 'DV')  
    // 3. Có đầy đủ thông tin BHYT
    if (req.role !== 'receptionist' && 
        exam_type === 'BHYT' && 
        health_insurance_number && 
        full_name && 
        date_of_birth) {
      
      try {
        // Mapping field names từ request format sang BHYT API format
        const bhytCheckResult = await healthInsuranceExamService.checkBHYTCard({
          maThe: health_insurance_number,    // health_insurance_number → maThe
          hoTen: full_name,                  // full_name → hoTen  
          ngaySinh: date_of_birth            // date_of_birth → ngaySinh
        });
        
        // Nếu check BHYT thất bại, trả về lỗi
        if (!bhytCheckResult.success) {
          return res.status(400).json({
            success: false,
            message: 'Thẻ BHYT không hợp lệ: ' + bhytCheckResult.message
          });
        }
      } catch (bhytError) {
        return res.status(400).json({
          success: false,
          message: 'Lỗi kiểm tra thẻ BHYT: ' + bhytError.message
        });
      }
    }
    
    // Truyền role từ req.role vào service
    const result = await healthInsuranceExamService.createExam({ ...req.body, role: req.role });
    
    // Nếu role là receptionist thì không trả về qr_code và encoded_id
    if (req.role === 'receptionist') {
      return res.status(201).json({
        success: true,
        message: 'Đặt lịch khám thành công',
        data: result.exam
      });
    }
    
    // Trường hợp còn lại vẫn trả về qr_code và encoded_id
    return res.status(201).json({
      success: true,
      message: 'Đặt lịch khám thành công',
      data: result.exam,
      qr_code: result.qr_code,
      encoded_id: result.encoded_id
    });
  } catch (error) {
    // Trả về lỗi do service xác định
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/health-insurance-exams/{id}:
 *   get:
 *     summary: Lấy thông tin lịch khám bảo hiểm y tế theo id
 *     tags:
 *       - HealthInsuranceExam
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId của lịch khám
 *     responses:
 *       200:
 *         description: Trả về thông tin lịch khám
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HealthInsuranceExam'
 *       404:
 *         description: Không tìm thấy lịch khám
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Lỗi truy vấn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getExamById = async (req, res) => {
  try {
    const exam = await healthInsuranceExamService.getExamById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch khám' });
    }
    return res.status(200).json({ success: true, data: exam });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /api/health-insurance-exams/check/{encoded_id}:
 *   get:
 *     summary: Check hiệu lực lịch khám bằng mã QR (encoded_id qua path)
 *     tags:
 *       - HealthInsuranceExam
 *     parameters:
 *       - in: path
 *         name: encoded_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã đã encode từ QR code
 *     responses:
 *       200:
 *         description: Kết quả check-in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 exam:
 *                   $ref: '#/components/schemas/HealthInsuranceExam'
 *       400:
 *         description: Check-in thất bại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const checkExamByEncodedId = async (req, res) => {
  try {
    const { encoded_id } = req.params;
    const result = await healthInsuranceExamService.checkExamByEncodedId(encoded_id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ valid: false, message: error.message });
  }
};

export default {
  createExam,
  getExamById,
  checkExamByEncodedId,
  checkBHYTCard
};