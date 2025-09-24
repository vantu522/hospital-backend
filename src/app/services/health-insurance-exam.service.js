import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);
import axios from 'axios';
import QRCode from 'qrcode';
import https from 'https';
import logger from '../../config/logger.js';

class HealthInsuranceExamService {
  getNowVN() {
    return dayjs().tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY');
  }

  formatDisplayDateTime(date, showTimeComponent = true) {
    if (!date) return '';
    try {
      let d;

      if (date instanceof Date) {
        d = date;
      } else if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        // Trường hợp dd/MM/yyyy
        const [day, month, year] = date.split('/');
        d = new Date(`${year}-${month}-${day}T00:00:00`);
      } else {
        d = new Date(date); // ISO hay timestamp
      }

      if (isNaN(d.getTime())) return '';

      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();

      if (!showTimeComponent) {
        return `${month}/${day}/${year}`;
      }

      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes} ${month}/${day}/${year}`;
    } catch {
      return '';
    }
  }
  
  //Khai báo agent 
  agent = new https.Agent({
    cert: process.env.CSS ? Buffer.from(process.env.CSS) : undefined,
    key: process.env.CSS ? Buffer.from(process.env.CSS) : undefined,
    rejectUnauthorized: false // dev, prod nên true
  });
  // Cache kết quả check BHYT thành công (key: maThe)
  bhytResultCache = {};

  // Chuyển đổi dữ liệu BHYT sang format chuẩn cho API bên thứ 3
  convertBHYTToThirdParty(bhytData) {
    return {
      "Domain": process.env.DOMAIN,
      SoBHYT: bhytData.maTheMoi || bhytData.maThe,
      HoVaTen: bhytData.hoTen,
      NgaySinh: bhytData.ngaySinh,
      GioiTinh: bhytData.gioiTinh === 'Nam',
      DiaChi: bhytData.diaChi,
      NoiDKBD: bhytData.maDKBD,
      TenBenhVienDKBD: bhytData.tenDKBDMoi || '',
      NgayDangKy: this.formatDisplayDateTime(bhytData.gtTheTu),
      NgayHieuLuc: this.formatDisplayDateTime(bhytData.gtTheTu),
      NgayHetHan: this.formatDisplayDateTime(bhytData.gtTheDen),
      maTheMoi: bhytData.maTheMoi || '',
      gtTheTuMoi: this.formatDisplayDateTime(bhytData.gtTheTuMoi),
      gtTheDenMoi: this.formatDisplayDateTime(bhytData.gtTheDenMoi),
      Active: true,
      IsBHYT5Nam: !!bhytData.ngayDu5Nam,
      NgayDu5Nam: bhytData.ngayDu5Nam,
      MaSoBHXH: bhytData.maSoBHXH,
      IsMaTheMoi: !!bhytData.maTheMoi,
    };
  }
  // Lock để đồng bộ lấy token mới khi gặp lỗi 401
  bhytTokenLock = false;
  // Cache token/id_token cho BHYT với TTL
  bhytTokenCache = {
    token: null,
    id_token: null,
    expiresAt: null
  };
  // Cache template để giảm DB query
  templatesCache = {
    data: null,
    expiresAt: null
  };

  // === Gọi API an toàn với retry cho lỗi mạng ===
  async safePost(url, body, options = {}, maxRetry = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      try {
        return await axios.post(url, body, { timeout: 15000, ...options });
      } catch (err) {
        if (['ECONNRESET', 'ECONNABORTED'].includes(err.code) || err.message.includes('timeout')) {
          lastError = err;
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
        throw new Error("Cổng BHYT phản hồi lâu, vui lòng quét lại");
      }
    }
    throw new Error("Cổng BHYT phản hồi lâu, vui lòng quét lại");
  }

  // === Lấy token BHYT với TTL từ server response ===
  async getBHYTToken() {
    while (this.bhytTokenLock) await new Promise(r => setTimeout(r, 100));

    // Check TTL cache
    if (this.bhytTokenCache.token &&
      this.bhytTokenCache.id_token &&
      this.bhytTokenCache.expiresAt > Date.now()) {
      return this.bhytTokenCache;
    }

    this.bhytTokenLock = true;
    try {
      const { BHYT_USERNAME: username, BHYT_PASSWORD: password, BHYT_TOKEN_URL: url } = process.env;

      const tokenRes = await this.safePost(url, { username, password });
      const apiKey = tokenRes.data.APIKey || {};

      // Tính TTL từ expires_in của server hoặc fallback 15 phút
      let expiresAt;
      if (apiKey.expires_in) {
        // Parse ISO string từ server: "2025-09-05T07:31:44.6200586Z"
        expiresAt = new Date(apiKey.expires_in).getTime();

        // Safety buffer: Trừ đi 30 giây để tránh edge case
        expiresAt -= (30 * 1000);
      } else {
        // Fallback: 15 phút nếu không có expires_in
        expiresAt = Date.now() + (15 * 60 * 1000);
      }

      this.bhytTokenCache = {
        token: apiKey.access_token || '',
        id_token: apiKey.id_token || '',
        expiresAt: expiresAt
      };

      return this.bhytTokenCache;
    } finally {
      this.bhytTokenLock = false;
    }
  }

  // === Kiểm tra thẻ BHYT với cơ chế refresh token khi gặp 401 ===
  async checkBHYTCard({ maThe, hoTen, ngaySinh }) {
  logger.info(`🔍 [BHYT_CHECK] Bắt đầu kiểm tra thẻ BHYT: ${JSON.stringify({ maThe, hoTen, ngaySinh })}`);

  logger.info(`🔍 [BHYT_CACHE] Trạng thái cache trước kiểm tra: ${JSON.stringify(Object.keys(this.bhytResultCache))}`);

  const { BHYT_USERNAME: username, BHYT_PASSWORD: password, BHYT_HOTENCB: hoTenCb, BHYT_CCCDCB: cccdCb, BHYT_CHECK_URL: bhytCheckUrl } = process.env;
  if (!bhytCheckUrl) {
    logger.error('❌ [BHYT_SERVICE] Missing BHYT_CHECK_URL in environment variables');
    return { success: false, message: 'Cấu hình API BHYT không đúng' };
  }

  logger.info('🔄 [BHYT_SERVICE] Getting token...');
  let { token, id_token } = await this.getBHYTToken();

  let currentMaThe = maThe;

  const requestAPI = async (maTheToCheck) => {
    const url = `${bhytCheckUrl}?id_token=${id_token}&password=${password}&token=${token}&username=${username}`;
    const body = { maThe: maTheToCheck, hoTen, ngaySinh, hoTenCb, cccdCb };
    return await this.safePost(url, body);
  };

  try {
    let response = await requestAPI(currentMaThe);

    if (response.data?.maKetQua === "401") {
      this.bhytTokenCache = { token: null, id_token: null, expiresAt: null };
      ({ token, id_token } = await this.getBHYTToken());
      await new Promise(r => setTimeout(r, 1000));
      response = await requestAPI(currentMaThe);

      if (response.data?.maKetQua === "401") {
        return { success: false, message: response.data.ghiChu || "Token không đúng.", code: "401", data: response.data };
      }
    }

    if (response.data?.maKetQua === "003" && response.data?.maTheMoi) {
      logger.warn(`⚠️ [BHYT_SERVICE] Mã lỗi 003, chuyển sang maTheMoi: ${response.data.maTheMoi}`);
      currentMaThe = response.data.maTheMoi;
      response = await requestAPI(currentMaThe);
    }

    if (response.data?.maKetQua === "000" || response.data?.maKetQua === "004") {
      const converted = this.convertBHYTToThirdParty(response.data);
      logger.info(`✅ [BHYT_CACHE] Lưu dữ liệu vào cache cho mã thẻ: ${currentMaThe}`);
      this.bhytResultCache[currentMaThe] = converted;
      logger.info(`✅ [BHYT_CACHE] Danh sách cache hiện tại: ${JSON.stringify(Object.keys(this.bhytResultCache).map(key => ({ key, hasData: !!this.bhytResultCache[key] })))}`);

      // Gọi API kiểm tra trong DB
      const existingExam = await healthInsuranceExamRepository.findOne({ BHYT: converted.SoBHYT });
      if (existingExam) {
        logger.info(`✅ [BHYT_CHECK] Tìm thấy bản ghi trong DB với BHYT: ${converted.SoBHYT}`);
        return { success: true, data: response.data, converted, existingExam };
      }

      return { success: true, data: response.data, converted };
    } else {
      logger.warn(`❌ [BHYT_CACHE] Không lưu vào cache vì maKetQua: ${response.data?.maKetQua}`);
      return {
        success: false,
        message: response.data?.ghiChu || `CCCD chưa tích hợp BHYT`,
        code: response.data?.maKetQua,
        data: response.data
      };
    }
  } catch (err) {
    logger.error(`❌ [BHYT_SERVICE] Lỗi khi check BHYT: ${err.message}`);
    return { success: false, message: err.message };
  }
}

  // === Cache templates với TTL để giảm DB query ===
  async getTemplatesCache() {
    if (this.templatesCache.data && this.templatesCache.expiresAt > Date.now()) {
      return this.templatesCache.data;
    }

    const TimeSlotTemplate = (await import('../../models/time-slot-template.model.js')).default;
    const templates = await TimeSlotTemplate.find({ is_active: true }).lean();

    logger.info(`🔄 [TEMPLATES] Đã load ${templates.length} khung giờ mẫu từ database`);

    this.templatesCache = {
      data: templates,
      expiresAt: Date.now() + (5 * 60 * 1000) // cache 5 phút
    };

    return templates;
  }

  // === Tạo hoặc lấy slot với logic tự động tìm slot tiếp theo cho receptionist ===
  async getOrCreateSlot(exam_date, exam_time, IdPhongKham, role) {
    const ScheduleSlot = (await import('../../models/schedule-slot.model.js')).default;
    const TimeSlotTemplate = (await import('../../models/time-slot-template.model.js')).default;

    logger.info(`🔍 [SLOT] Tìm slot cho phòng: ${IdPhongKham}, ngày: ${new Date(exam_date).toLocaleDateString()}, giờ: ${exam_time}`);

    const findNextAvailableSlot = (currentTime, templates) => {
      const formatTime = (timeStr) => {
        try {
          const [h, m] = timeStr.split(':').map(Number);
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        } catch {
          return timeStr;
        }
      };

      const toMinutes = t => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };

      const formattedCurrentTime = formatTime(currentTime);
      const target = toMinutes(formattedCurrentTime);

      logger.info(`🔍 [SLOT] Có ${templates.length} khung giờ mẫu khả dụng: ${templates.map(t => t.time).join(', ')}`);

      const exactMatch = templates.find(tpl => tpl.time === formattedCurrentTime);
      if (exactMatch) {
        logger.info(`✅ [SLOT] Tìm thấy khung giờ chính xác: ${exactMatch.time}`);
        return exactMatch;
      }

      const sortedTemplates = [...templates].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
      let nextSlot = null;

      for (const tpl of sortedTemplates) {
        const tplMinutes = toMinutes(tpl.time);
        if (tplMinutes > target) {
          nextSlot = tpl;
          logger.info(`✅ [SLOT] Tìm thấy khung giờ tiếp theo: ${tpl.time} (sau ${tplMinutes - target} phút)`);
          break;
        }
      }

      if (!nextSlot) {
        logger.warn(`❌ [SLOT] Không tìm thấy khung giờ nào sau ${formattedCurrentTime}, đã hết khung giờ đặt khám`);
        return null;
      }

      return nextSlot;
    };

    let template = await TimeSlotTemplate.findOne({ time: exam_time, is_active: true }).lean();
    let adjustedTime = exam_time;
    const allTemplates = await this.getTemplatesCache();

    if (allTemplates.length === 0) {
      throw new Error('Không có khung giờ mẫu nào đang hoạt động');
    }

    logger.info(`🔍 [SLOT] Tìm khung giờ mẫu ${exam_time}: ${template ? 'Tìm thấy' : 'Không tìm thấy'}`);

    const existingSlotsForRoom = await ScheduleSlot.find({
      date: exam_date,
      IdPhongKham,
      is_active: true
    }).lean();

    if (!template) {
      if (role === 'receptionist') {
        const foundTemplate = findNextAvailableSlot(exam_time, allTemplates);
        if (!foundTemplate) {
          throw new Error('Đã hết khung giờ đặt khám trong ngày. Vui lòng chọn ngày khác.');
        }
        template = foundTemplate;
        adjustedTime = template.time;
      } else {
        throw new Error(`Khung giờ ${exam_time} không có trong lịch khám. Vui lòng chọn khung giờ khác.`);
      }
    }

    let slot = null;
    const slotsToCheck = [];
    let currentTime = adjustedTime;
    let currentTemplate = template;

    for (let i = 0; i < 5; i++) {
      slotsToCheck.push({ date: exam_date, timeSlot: currentTime, IdPhongKham, template: currentTemplate });
      if (i < 4) {
        const nextTemplate = findNextAvailableSlot(currentTime, allTemplates);
        if (!nextTemplate) break;
        currentTime = nextTemplate.time;
        currentTemplate = nextTemplate;
      }
    }

    const existingSlots = await ScheduleSlot.find({
      date: exam_date,
      timeSlot: { $in: slotsToCheck.map(s => s.timeSlot) },
      IdPhongKham
    }).lean();

    logger.info(`🔍 [SLOT] Các khung giờ cần kiểm tra: ${slotsToCheck.map(s => s.timeSlot).join(', ')}`);

    if (existingSlots.length === 0 && existingSlotsForRoom.length === 0 && role === 'receptionist') {
      logger.info(`🔍 [SLOT] Phòng mới - tạo slot đầu tiên cho phòng ${IdPhongKham}`);
      try {
        slot = await ScheduleSlot.create({
          date: exam_date,
          timeSlot: adjustedTime,
          IdPhongKham,
          capacity: template.capacity,
          currentCount: 1,
          is_active: true
        });
        return { slot, adjustedTime };
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }

    for (const slotInfo of slotsToCheck) {
      const existingSlot = existingSlots.find(s => s.timeSlot === slotInfo.timeSlot);
      logger.info(`🔍 [SLOT] Kiểm tra slot ${slotInfo.timeSlot}: ${existingSlot ? `Đã tồn tại (${existingSlot.currentCount}/${existingSlot.capacity})` : 'Chưa tồn tại'}`);

      if (!existingSlot) {
        try {
          logger.info(`🔍 [SLOT] Tạo mới slot cho phòng ${IdPhongKham}, giờ ${slotInfo.timeSlot}`);
          slot = await ScheduleSlot.create({
            date: exam_date,
            timeSlot: slotInfo.timeSlot,
            IdPhongKham: slotInfo.IdPhongKham,
            capacity: slotInfo.template.capacity,
            currentCount: 1,
            is_active: true
          });
          adjustedTime = slotInfo.timeSlot;
          break;
        } catch (err) {
          logger.error(`❌ [SLOT] Lỗi khi tạo slot: ${err.message}, code: ${err.code}`);
          if (err.code === 11000) continue;
          throw err;
        }
      }

      if (existingSlot && existingSlot.currentCount < existingSlot.capacity) {
        logger.info(`🔍 [SLOT] Cập nhật slot hiện có: ${existingSlot.timeSlot}, count: ${existingSlot.currentCount} -> ${existingSlot.currentCount + 1}`);
        const updatedSlot = await ScheduleSlot.findByIdAndUpdate(
          existingSlot._id,
          { $inc: { currentCount: 1 } },
          { new: true }
        );
        if (updatedSlot && updatedSlot.currentCount <= updatedSlot.capacity) {
          slot = updatedSlot;
          adjustedTime = slotInfo.timeSlot;
          break;
        }
      }

      if (role !== 'receptionist') {
        throw new Error('Slot đã đầy, vui lòng chọn khung giờ khác');
      }
    }

    if (!slot) {
      logger.warn(`❌ [SLOT] Không tìm thấy slot phù hợp cho phòng ${IdPhongKham} sau khi kiểm tra tất cả khung giờ`);
      throw new Error('Không tìm thấy khung giờ trống nào trong ngày');
    }

    logger.info(`✅ [SLOT] Tìm thấy slot phù hợp: phòng ${IdPhongKham}, giờ ${adjustedTime}, slot ID: ${slot._id}`);
    return { slot, adjustedTime };
  }

  // === Tạo lịch khám với order number logic fixed ===
  async createExam(data) {
    // Sử dụng IdPhongKham cho slot và queue logic
    const { slot, adjustedTime } = await this.getOrCreateSlot(data.exam_date, data.exam_time, data.IdPhongKham, data.role);

    // Cập nhật lại giờ khám nếu có điều chỉnh
    data.exam_time = adjustedTime;
    data.status = data.role === 'receptionist' ? 'accept' : 'pending';
    data.slotId = slot._id;
    data.IdPhongKham = slot.IdPhongKham;

    // Không sinh số thứ tự, số thứ tự sẽ lấy từ HIS trả về

    // Parallel operations sau khi đã có order_number
    const [exam, phongKhamObj] = await Promise.all([
      healthInsuranceExamRepository.create(data),
      (async () => {
        const PhongKham = (await import('../../models/phong-kham.model.js')).default;
        return PhongKham.findOne({ _id: data.IdPhongKham }, 'ten').lean();
      })()
    ]);

    let soXepHang = null;

    // Nếu status là accept (role receptionist), đẩy ngay lên HIS và đợi kết quả
    if (data.status === 'accept') {
      logger.info('🏥 [HIS] Đẩy dữ liệu lên HIS cho bản ghi có status accept');
      const hisResult = await this.pushToHIS(exam);
      if (!hisResult.success) {
        const errorDetails = hisResult.details && Object.keys(hisResult.details).length > 0
          ? JSON.stringify(hisResult.details)
          : hisResult.error;
        throw new Error(`Không thể đẩy dữ liệu lên HIS: ${errorDetails}`);
      }

      soXepHang = hisResult.data.SoXepHang;
      logger.info('✅ [HIS] Đẩy dữ liệu lên HIS thành công');
    }

    // Tạo QR code
    const encodedId = Buffer.from(exam._id.toString()).toString('base64');
    const qrImageBase64 = await QRCode.toDataURL(encodedId);

    // **Trả về ngay cho client**, kèm SoXepHang
    const responseData = {
      exam: {
        ...exam.toObject(),
        IdPhongKham: exam.IdPhongKham,
        clinic: phongKhamObj?.ten || '',
        SoXepHang: soXepHang // thêm field vào response
      },
      qr_code: qrImageBase64,
      encoded_id: encodedId
    };

    // **Update DB sau, không chặn response**
    if (soXepHang) {
      setImmediate(async () => {
        try {
          await healthInsuranceExamRepository.update(exam._id, { SoXepHang: soXepHang });
          logger.info('💾 [EXAM] Đã cập nhật SoXepHang vào DB cho exam:', exam._id);
        } catch (err) {
          logger.error('❌ [EXAM] Lỗi khi cập nhật SoXepHang vào DB:', err.message);
        }
      });
    }

    return responseData;

  }

  // === Check lịch khám theo QR code với parallel operations ===
  async checkExamByEncodedId(encodedId) {
    let id;
    try { id = Buffer.from(encodedId, 'base64').toString('utf-8'); }
    catch { throw new Error('QR code không hợp lệ'); }

    const exam = await healthInsuranceExamRepository.findById(id);
    if (!exam) throw new Error('Không tìm thấy lịch khám');

    const now = new Date();
    const [h, m] = exam.exam_time.split(':').map(Number);
    const examDateTime = new Date(exam.exam_date);
    examDateTime.setHours(h, m, 0, 0);

    if (now < examDateTime) return { valid: false, message: 'Chưa tới giờ khám', exam };

    if ((now - examDateTime) / (1000 * 60) > 15) {
      await healthInsuranceExamRepository.updateOrderNumber(exam._id, null, 'reject');
      return { valid: false, message: 'Lịch khám bị hủy do tới trễ quá 15 phút', exam };
    }

    if (exam.status !== 'accept') {
      logger.info(`🔢 [CHECK_EXAM] Cập nhật status thành accept cho lịch khám ID: ${exam._id}`);
      exam.status = 'accept';
      logger.info('🏥 [HIS] Đẩy dữ liệu lên HIS sau khi update status');
      const hisResult = await this.pushToHIS(exam);
      if (!hisResult.success) {
        logger.error('❌ [HIS] Lỗi khi đẩy dữ liệu lên HIS sau khi update status:',
          hisResult.details ? JSON.stringify(hisResult.details) : hisResult.error);
        return {
          valid: true,
          message: 'Lịch khám hợp lệ, check-in thành công. Lưu ý: Không thể đồng bộ với HIS.',
          exam,
          warning: 'Không thể đồng bộ dữ liệu với HIS. Vui lòng kiểm tra lại sau.'
        };
      }
      // Gán số thứ tự từ HIS trả về cho object trả response
      exam.SoXepHang = hisResult.data.SoXepHang;

      // Update DB cả status + SoXepHang sau khi đã có đủ thông tin
      setImmediate(async () => {
        try {
          await healthInsuranceExamRepository.update(exam._id, {
            status: 'accept',
            SoXepHang: hisResult.data.SoXepHang
          });
          logger.info(`💾 [EXAM] Đã cập nhật status + SoXepHang vào DB cho exam: ${exam._id}`);
        } catch (err) {
          logger.error('❌ [EXAM] Lỗi khi cập nhật status + SoXepHang vào DB:', err.message);
        }
      });
    }


    return { valid: true, message: 'Lịch khám hợp lệ, check-in thành công', exam };
  }

  // Cache token HIS
  hisTokenCache = {
    access_token: null,
    expiresAt: null
  }

  // === Lấy token HIS với caching ===
  async getHISToken() {
    logger.info('🔑 [HIS] Kiểm tra token HIS');

    // Kiểm tra token cache còn hạn không
    if (this.hisTokenCache.access_token && this.hisTokenCache.expiresAt > Date.now()) {
      logger.info('🔑 [HIS] Sử dụng token HIS đã cache');
      return this.hisTokenCache.access_token;
    }

    try {
      const { API_LOGIN_HIS_DUCTHO, HIS_ACCOUNT, HIS_PASSWORD, CLIENT_ID_HIS } = process.env;

      if (!API_LOGIN_HIS_DUCTHO || !HIS_ACCOUNT || !HIS_PASSWORD) {
        throw new Error('Thiếu thông tin cấu hình kết nối HIS');
      }

      logger.info('🔑 [HIS] Đang lấy token mới từ: %s', API_LOGIN_HIS_DUCTHO);

      // Tạo params theo định dạng form-urlencoded
      const params = new URLSearchParams();
      params.append('client_id', CLIENT_ID_HIS);
      params.append('grant_type', 'password');
      params.append('username', HIS_ACCOUNT);
      params.append('password', HIS_PASSWORD);

      // Headers cho form-urlencoded
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      // Gửi request với params và agent
      const response = await axios.post(API_LOGIN_HIS_DUCTHO, params, { headers, httpsAgent: this.agent });

      logger.info('✅ [HIS] Nhận phản hồi từ server HIS: %s', response.status);

      if (!response.data || !response.data.access_token) {
        logger.error('❌ [HIS] Phản hồi không có access_token: %o', response.data);
        throw new Error('Không nhận được access_token từ HIS');
      }

      // Cache token với thời hạn - giảm 60s để đảm bảo an toàn
      const expiresIn = response.data.expires_in || 3600; // Mặc định 1 giờ nếu không có
      this.hisTokenCache = {
        access_token: response.data.access_token,
        expiresAt: Date.now() + (expiresIn - 60) * 1000
      };

      logger.info('🔑 [HIS] Đã lấy được token HIS mới, hết hạn sau: %d giây', expiresIn);
      return this.hisTokenCache.access_token;

    } catch (error) {
      logger.error('❌ [HIS] Lỗi khi lấy token HIS: %s', error.message);
      throw new Error(`Không thể lấy token HIS: ${error.message}`);
    }
  }
  async pushToHIS(exam) {
    logger.info('🏥 [HIS] Đẩy thông tin lên HIS: %s', exam._id);

    try {
      // 1. Lấy token trước khi gọi API
      const token = await this.getHISToken();

      // 2. Lấy API URL từ biến môi trường
      const { API_PUSH_TO_HIS_DUCTHO } = process.env;
      if (!API_PUSH_TO_HIS_DUCTHO) {
        throw new Error('Thiếu cấu hình API_PUSH_TO_HIS_DUCTHO');
      }

      logger.info('🏥 [HIS] Chuẩn bị dữ liệu để gửi lên HIS');

      const PhongKham = (await import('../../models/phong-kham.model.js')).default;
      const clinic = await PhongKham.findById(exam.IdPhongKham).lean();

      let dmBHYT = null;
      const bhytKey = exam.BHYT;
      const cccdKey = exam.CCCD;

      if (exam.exam_type === 'BHYT') {
        logger.info('🔍 [BHYT_CACHE] Tổng số cache: %d', Object.keys(this.bhytResultCache).length);
        logger.info('🔍 [BHYT_CACHE] Các khóa trong cache: %o', Object.keys(this.bhytResultCache));
        logger.info('🔍 [BHYT_CACHE] Kiểm tra mã BHYT: %s, CCCD: %s', bhytKey, cccdKey);

        if (bhytKey && this.bhytResultCache[bhytKey]) {
          try {
            const cachedData = this.bhytResultCache[bhytKey];
            logger.info('🔍 [BHYT_CACHE] Dữ liệu BHYT từ cache: %o', cachedData);

            if (cachedData && typeof cachedData === 'object' && cachedData.SoBHYT && cachedData.HoVaTen) {
              dmBHYT = cachedData;
              logger.info('🏥 [HIS] Sử dụng thông tin BHYT từ cache (mã BHYT): %s', bhytKey);
            } else {
              logger.warn('🏥 [HIS] Dữ liệu BHYT cache không hợp lệ');
            }
          } catch (err) {
            logger.error('❌ [HIS] Lỗi xử lý dữ liệu BHYT từ cache: %s', err.message);
          }
        }

        if (!dmBHYT && cccdKey && this.bhytResultCache[cccdKey]) {
          try {
            const cachedData = this.bhytResultCache[cccdKey];
            logger.info('🔍 [BHYT_CACHE] Dữ liệu cache từ CCCD: %o', cachedData);

            if (cachedData && typeof cachedData === 'object' && cachedData.SoBHYT && cachedData.HoVaTen) {
              dmBHYT = cachedData;
              logger.info('🏥 [HIS] Sử dụng thông tin BHYT từ cache (mã CCCD): %s', cccdKey);
            } else {
              logger.warn('🏥 [HIS] Dữ liệu BHYT cache từ CCCD không hợp lệ');
            }
          } catch (err) {
            logger.error('❌ [HIS] Lỗi xử lý dữ liệu BHYT từ cache (CCCD): %s', err.message);
          }
        }

        if (!dmBHYT && (bhytKey || cccdKey)) {
          logger.info('🏥 [HIS] Không tìm thấy thông tin BHYT trong cache cho BHYT và CCCD');
        }
      } else {
        logger.info('🏥 [HIS] Không tìm thông tin BHYT vì exam_type là: %s', exam.exam_type);
      }
      // 4. Tạo payload
      const basePayload = {
        GioiTinh: exam.GioiTinh === 'Nam',
        IdDanToc: exam.IdDanToc,
        TenDanToc: exam.TenDanToc,
        IdQuocTich: exam.IdQuocTich,
        MaDoiTuongKCB: exam.exam_type === 'BHYT' ? '3.3' : '9',
        MaTinh: exam.MaTinh,
        TenTinh: exam.TenTinh,
        IdTinhThanh: exam.IdTinhThanh,
        IdXaPhuong: exam.IdXaPhuong,
        IdBenhVien: process.env.ID_BENHVIEN_HIS,
        IdKhoaKham: exam.IdKhoaKham,
        IsDonTiepCCCD: !!exam.CCCD,
        CMNDNoiCap: process.env.NOI_CAP_CCCD_HIS,
        CMNDNgayCap: this.formatDisplayDateTime(exam.CMNDNgayCap, false),
        IsMSTCaNhan: true,
        MaXa: exam.MaXa,
        TenXa: exam.TenXa,
        MaPhongKham: exam.MaPhongKham,
        TenPhongKham: exam.TenPhongKham,
        IdPhongKham: exam.IdPhongKham,
        IdLoaiKham: exam.IdLoaiKham,
        HoTen: exam.HoTen,
        DienThoai: exam.DienThoai,
        SoNha: exam.SoNha,
        IdNgheNghiep: exam.IdNgheNghiep,
        TenNgheNghiep: exam.TenNgheNghiep || 'Khác',
        NgaySinh: this.formatDisplayDateTime(exam.NgaySinh, false),
        DiaChi: exam.DiaChi,
        IdCanBoDonTiep: process.env.ID_CANBO_HIS || '3923362b-5ec4-4d11-ae0f-684001f67748',
        IdCongKhamBanDau: exam.IdCongKhamBanDau,
        NgayKham: this.getNowVN(),
        NgayDonTiep: this.getNowVN(),
        Status: 0
      };

      const payload = exam.exam_type === 'BHYT'
        ? { ...basePayload, ...(dmBHYT && { DmBHYT: dmBHYT }), IsBHYT: !!dmBHYT, IsDungTuyen: !!dmBHYT, SoBHYT: dmBHYT ? dmBHYT.SoBHYT : exam.SoBHYT, CMND: exam.CCCD }
        : basePayload;

  logger.info('🏥 [HIS] Payload gửi lên HIS: %o', payload);
  logger.info(`[LOG] NgayKham:`, payload.NgayKham);
  logger.info(`[LOG] NgayDonTiep:`, payload.NgayDonTiep);

      // 5. Gọi API
      const response = await axios.post(API_PUSH_TO_HIS_DUCTHO, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        httpsAgent: this.agent,
        timeout: 30000
      });

      logger.info('✅ [HIS] Phản hồi HIS: %s %s', response.status, response.statusText);
      logger.info('✅ [HIS] Data phản hồi: %o', response.data);

      if (response.data && response.data.statusCode && response.data.statusCode !== 200) {
        logger.error('❌ [HIS] API trả về mã lỗi: %s', response.data.statusCode);
        return { success: false, error: `API HIS trả về mã lỗi: ${response.data.statusCode}`, details: response.data };
      }

      if (!response.data || (typeof response.data === 'object' && Object.keys(response.data).length === 0)) {
        logger.error('❌ [HIS] API trả về dữ liệu rỗng');
        return { success: false, error: 'API HIS trả về dữ liệu rỗng', details: response.data };
      }

      logger.info('✅ [HIS] Đẩy thông tin HIS thành công: %s', exam._id);
      return { success: true, data: response.data };

    } catch (error) {
      logger.error('❌ [HIS] Lỗi khi đẩy dữ liệu HIS: %s | Bệnh nhân: %s (ID: %s)', error.message, exam.HoTen, exam._id);
      return { success: false, error: error.message, details: error.response?.data || {} };
    } finally {
      // Xóa cache BHYT sau khi push
      const bhytKey = exam.BHYT;
      const cccdKey = exam.CCCD;
      if (bhytKey && this.bhytResultCache[bhytKey]) {
        delete this.bhytResultCache[bhytKey];
        logger.info('🧹 [BHYT_CACHE] Xóa cache BHYT: %s', bhytKey);
      }
      if (cccdKey && this.bhytResultCache[cccdKey]) {
        delete this.bhytResultCache[cccdKey];
        logger.info('🧹 [BHYT_CACHE] Xóa cache CCCD: %s', cccdKey);
      }
      logger.info('🧹 [BHYT_CACHE] Số lượng cache còn lại: %d', Object.keys(this.bhytResultCache).length);
    }
  }

  // === Lấy tất cả lịch khám với phân trang ===
  async getAllExams(options = {}) {
    logger.info('🔍 [EXAM_SERVICE] Lấy danh sách lịch khám với options: %o', options);

    try {
      // Xử lý tham số đầu vào
      const queryOptions = {
        page: options.page ? parseInt(options.page) : 1,
        limit: options.limit ? parseInt(options.limit) : 10,
        sortBy: options.sortBy || 'createdAt',
        sortOrder: -1, // giảm dần
        filters: {}
      };

      // Filters
      if (options.status) queryOptions.filters.status = options.status;
      if (options.exam_type) queryOptions.filters.exam_type = options.exam_type;
      if (options.IdPhongKham) queryOptions.filters.IdPhongKham = options.IdPhongKham;

      // Filter theo ngày khám
      if (options.exam_date) {
        const examDate = new Date(options.exam_date);
        if (!isNaN(examDate.getTime())) {
          const startDate = new Date(examDate);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(examDate);
          endDate.setHours(23, 59, 59, 999);

          queryOptions.filters.exam_date = { $gte: startDate, $lte: endDate };
        }
      }

      // Lấy dữ liệu từ repository
      const result = await healthInsuranceExamRepository.findAll(queryOptions);

      logger.info('✅ [EXAM_SERVICE] Lấy thành công %d/%d lịch khám', result.data.length, result.total);
      return result;

    } catch (error) {
      logger.error('❌ [EXAM_SERVICE] Lỗi khi lấy danh sách lịch khám: %s', error.message);
      throw new Error(`Không thể lấy danh sách lịch khám: ${error.message}`);
    }
  }

  // Helper method để thêm thông tin phòng khám vào danh sách lịch khám
  // === Cập nhật thông tin lịch khám ===
  async updateExam(id, data) {
    logger.info('🔄 [EXAM_SERVICE] Cập nhật lịch khám: %s', id);

    try {
      const exam = await healthInsuranceExamRepository.findById(id);
      if (!exam) {
        throw new Error('Không tìm thấy lịch khám');
      }

      // Loại bỏ các trường không được phép cập nhật
      const allowedUpdates = { ...data };
      delete allowedUpdates._id;
      delete allowedUpdates.is_deleted;
      delete allowedUpdates.created_at;
      delete allowedUpdates.updated_at;

      const updatedExam = await healthInsuranceExamRepository.update(id, allowedUpdates);

      logger.info('✅ [EXAM_SERVICE] Cập nhật lịch khám thành công: %s', id);
      return updatedExam;
    } catch (error) {
      logger.error('❌ [EXAM_SERVICE] Lỗi khi cập nhật lịch khám: %s', error.message);
      throw new Error(`Không thể cập nhật lịch khám: ${error.message}`);
    }
  }

  // === Xóa lịch khám ===
  async deleteExam(id) {
    logger.info('🗑️ [EXAM_SERVICE] Xóa lịch khám: %s', id);

    try {
      const exam = await healthInsuranceExamRepository.findById(id);
      if (!exam) {
        throw new Error('Không tìm thấy lịch khám');
      }

      // Soft delete
      await healthInsuranceExamRepository.remove(id);

      logger.info('✅ [EXAM_SERVICE] Xóa lịch khám thành công: %s', id);
      return { success: true, message: 'Xóa lịch khám thành công' };
    } catch (error) {
      logger.error('❌ [EXAM_SERVICE] Lỗi khi xóa lịch khám: %s', error.message);
      throw new Error(`Không thể xóa lịch khám: ${error.message}`);
    }
  }

  // === Lấy thông tin lịch khám theo ID ===
  async getExamById(id) {
    try {
      const exam = await healthInsuranceExamRepository.findById(id);
      if (!exam) {
        throw new Error('Không tìm thấy lịch khám');
      }
      return exam;
    } catch (error) {
      logger.error('❌ [EXAM_SERVICE] Lỗi khi lấy lịch khám theo ID: %s', error.message);
      throw new Error(`Không thể lấy lịch khám: ${error.message}`);
    }
  }
  async findOne(filter) {
    return await healthInsuranceExamRepository.findOne(filter);
  }
}

export default new HealthInsuranceExamService();
