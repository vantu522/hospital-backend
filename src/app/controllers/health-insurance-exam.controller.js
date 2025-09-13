import healthInsuranceExamService from '../services/health-insurance-exam.service.js';

/**
 * @swagger
 * /api/health-insurance-exams/check-bhyt-date:
 *   post:
 *     summary: Kiểm tra thông tin CCCD qua API quốc gia
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
 *                 description: Mã CCCD
 *               hoTen:
 *                 type: string
 *                 description: Họ tên người khám
 *               ngaySinh:
 *                 type: string
 *                 description: "Ngày sinh (dd/mm/yyyy, ví dụ 25/08/1990)"
 *           example:
 *             maThe: "001205036719"
 *             hoTen: "Nguyen Van A"
 *             ngaySinh: "25/08/1990"
 *     responses:
 *       200:
 *         description: Thông tin CCCD hợp lệ
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
 *         description: Thông tin CCCD không hợp lệ hoặc lỗi xác thực
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
      return res.status(400).json({ success: false, message: 'Thiếu thông tin mã CCCD, họ tên hoặc ngày sinh' });
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
 *               - HoTen
 *               - DienThoai
 *               - NgaySinh
 *               - GioiTinh
 *               - DiaChi
 *               - IdPhongKham
 *               - MaPhongKham
 *               - TenPhongKham
 *               - IdLoaiKham
 *               - MaTinh
 *               - TenTinh
 *               - IdTinhThanh
 *               - MaXa
 *               - TenXa
 *               - IdXaPhuong
 *               - IdDanToc
 *               - TenDanToc
 *               - IdQuocTich
 *               - IdKhoaKham
 *               - IdNgheNghiep
 *               - TenNgheNghiep
 *               - IdCanBoDonTiep
 *               - IdBenhVien
 *               - exam_type
 *               - exam_date
 *               - exam_time
 *               - IsDonTiepCCCD
 *             properties:
 *               HoTen:
 *                 type: string
 *                 description: Họ tên bệnh nhân
 *               DienThoai:
 *                 type: string
 *                 description: Số điện thoại liên hệ
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email liên hệ (không bắt buộc)
 *               CCCD:
 *                 type: string
 *                 description: Số căn cước công dân (bắt buộc nếu IsDonTiepCCCD=true)
 *               NgaySinh:
 *                 type: string
 *                 format: date
 *                 description: Ngày sinh bệnh nhân
 *               GioiTinh:
 *                 type: string
 *                 enum: [Nam, Nữ, Khác]
 *                 description: Giới tính bệnh nhân
 *               DiaChi:
 *                 type: string
 *                 description: Địa chỉ liên hệ
 *               BHYT:
 *                 type: string
 *                 description: Số bảo hiểm y tế (không bắt buộc)
 *               
 *               # Thông tin phòng khám
 *               IdPhongKham:
 *                 type: string
 *                 description: ID phòng khám 
 *               MaPhongKham:
 *                 type: string
 *                 description: Mã phòng khám
 *               TenPhongKham:
 *                 type: string
 *                 description: Tên phòng khám
 *               
 *               # Thông tin loại khám
 *               IdLoaiKham:
 *                 type: string
 *                 description: ID loại khám
 *               
 *               # Thông tin địa chỉ
 *               MaTinh:
 *                 type: string
 *                 description: Mã tỉnh
 *               TenTinh:
 *                 type: string
 *                 description: Tên tỉnh
 *               IdTinhThanh:
 *                 type: string
 *                 description: ID tỉnh thành
 *               MaXa:
 *                 type: string
 *                 description: Mã xã
 *               TenXa:
 *                 type: string
 *                 description: Tên xã
 *               IdXaPhuong:
 *                 type: string
 *                 description: ID xã phường
 *               
 *               # Thông tin khác
 *               IdDanToc:
 *                 type: string
 *                 description: ID dân tộc
 *               TenDanToc:
 *                 type: string
 *                 description: Tên dân tộc
 *               IdQuocTich:
 *                 type: string
 *                 description: ID quốc tịch
 *               IdKhoaKham:
 *                 type: string
 *                 description: ID khoa khám
 *               IdNgheNghiep:
 *                 type: string
 *                 description: ID nghề nghiệp
 *               TenNgheNghiep:
 *                 type: string
 *                 description: Tên nghề nghiệp
 *               IdCanBoDonTiep:
 *                 type: string
 *                 description: ID cán bộ đón tiếp
 *               IdBenhVien:
 *                 type: string
 *                 description: ID bệnh viện
 *               
 *               # Thông tin lịch khám
 *               exam_type:
 *                 type: string
 *                 enum: [BHYT, DV]
 *                 description: Loại hình khám
 *               exam_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày khám
 *               exam_time:
 *                 type: string
 *                 description: Giờ khám
 *               symptoms:
 *                 type: string
 *                 description: Triệu chứng (không bắt buộc)
 *               IsDonTiepCCCD:
 *                 type: boolean
 *                 description: Đánh dấu đơn tiếp CCCD
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
    const { 
      exam_type, 
      CCCD,
      HoTen,
      NgaySinh
    } = req.body;
    
    // Chỉ call API BHYT nếu:
    // 1. Role là 'user' (không phải receptionist)
    // 2. exam_type là 'BHYT' (không phải 'DV')  
    // 3. Có đầy đủ thông tin CCCD
    if (req.role !== 'receptionist' && 
        exam_type === 'BHYT' && 
        CCCD && 
        HoTen && 
        NgaySinh) {
      
      console.log('🔍 [BOOKING] Calling BHYT API for user booking');
      
      try {
        // Convert NgaySinh sang format dd/mm/yyyy cho API BHYT
        let formattedDate;
        if (typeof NgaySinh === 'string' && NgaySinh.includes('/')) {
          formattedDate = NgaySinh;
        } else {
          
          const dateObj = new Date(NgaySinh);
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const year = dateObj.getFullYear();
          formattedDate = `${day}/${month}/${year}`;
        }
        
        
        const bhytCheckResult = await healthInsuranceExamService.checkBHYTCard({
          maThe: CCCD,    
          hoTen: HoTen,                   
          ngaySinh: formattedDate           
        });
        
        // Nếu check BHYT thất bại, trả về lỗi
        if (!bhytCheckResult.success) {
          return res.status(400).json({
            success: false,
            message: 'CCCD chưa tích hợp BHYT: ' + bhytCheckResult.message
          });
        }
        
        // Nếu check BHYT thành công, lưu mã CCCD vào trường BHYT để sử dụng lại
        req.body.BHYT = CCCD;
      } catch (bhytError) {
        return res.status(400).json({
          success: false,
          message: 'Lỗi khi gọi cổng BHYT: ' + bhytError.message
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