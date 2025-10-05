import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';
import axios from 'axios';
import QRCode from 'qrcode';
import https from 'https';
import logger from '../../config/logger.js';

class HealthInsuranceExamService {
  
  constructor() {
    // Tự động dọn dẹp session cache mỗi 10 phút
    setInterval(() => {
      this.cleanupSessionCache();
    }, 10 * 60 * 1000);
  }

  // Dọn dẹp cache hết hạn
  cleanupSessionCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, value] of Object.entries(this.sessionCache)) {
      if (value.expiresAt < now) {
        delete this.sessionCache[key];
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.debug('Session cache cleanup completed', {
        operation: 'cleanupSessionCache',
        cleanedEntries: cleanedCount,
        remainingEntries: Object.keys(this.sessionCache).length
      });
    }
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
  // Session-based cache for current request only (cleared after use)
  sessionCache = {};

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
    const correlationId = `bhyt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    // Check session cache first (same request, multiple validations)
    const sessionKey = `${maThe}_${hoTen}_${ngaySinh}`;
    if (this.sessionCache[sessionKey] && this.sessionCache[sessionKey].expiresAt > Date.now()) {
      logger.info('Using session cache for BHYT verification', {
        operation: 'checkBHYTCard',
        correlationId,
        source: 'session_cache',
        cacheAge: Date.now() - this.sessionCache[sessionKey].createdAt
      });
      return this.sessionCache[sessionKey].data;
    }

    logger.info('Starting BHYT card verification', {
      operation: 'checkBHYTCard',
      correlationId,
      input: { maThe: maThe?.substring(0, 8) + '***', hoTen, ngaySinh },
      sessionCacheSize: Object.keys(this.sessionCache).length
    });

  const { BHYT_USERNAME: username, BHYT_PASSWORD: password, BHYT_HOTENCB: hoTenCb, BHYT_CCCDCB: cccdCb, BHYT_CHECK_URL: bhytCheckUrl } = process.env;
  if (!bhytCheckUrl) {
    logger.error('BHYT configuration missing', {
      operation: 'checkBHYTCard',
      correlationId,
      error: 'BHYT_CHECK_URL not configured',
      severity: 'critical'
    });
    return { success: false, message: 'Cấu hình API BHYT không đúng' };
  }

    logger.debug('Retrieving BHYT authentication token', {
      operation: 'checkBHYTCard',
      correlationId,
      step: 'token_retrieval'
    });
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

      this.bhytResultCache[currentMaThe] = converted;

      if (currentMaThe !== maThe) {
        this.bhytResultCache[maThe] = converted;
      }
      if (converted?.CCCD || converted?.SoCCCD) {
        const cccdKey = converted.CCCD || converted.SoCCCD;
        this.bhytResultCache[cccdKey] = converted;
      }
      
      const existingExam = await healthInsuranceExamRepository.findOne({ BHYT: converted.SoBHYT });
      
      // Cache for current session only (5 minutes max - for duplicate checks in same request)
      const result = existingExam ? 
        { success: true, data: response.data, converted, existingExam } : 
        { success: true, data: response.data, converted };
        
      this.sessionCache[sessionKey] = {
        data: result,
        createdAt: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 phút - chỉ cho session hiện tại
      };
      
      logger.info('BHYT verification successful', {
        operation: 'checkBHYTCard',
        correlationId,
        resultCode: response.data.maKetQua,
        cardUsed: currentMaThe !== maThe ? 'new_card' : 'original_card',
        cacheKeys: [currentMaThe, maThe, converted?.CCCD].filter(Boolean).length,
        existingRecord: !!existingExam,
        duration: Date.now() - startTime,
        performance: 'success'
      });
      
      if (existingExam) {
        return { success: true, data: response.data, converted, existingExam };
      }

      return { success: true, data: response.data, converted };
    } else {
      logger.warn('BHYT verification failed', {
        operation: 'checkBHYTCard',
        correlationId,
        resultCode: response.data?.maKetQua,
        reason: response.data?.ghiChu || 'Unknown error',
        duration: Date.now() - startTime,
        performance: 'failed'
      });
      return {
        success: false,
        message: response.data?.ghiChu || `CCCD chưa tích hợp BHYT`,
        code: response.data?.maKetQua,
        data: response.data
      };
    }
  } catch (err) {
    logger.error('BHYT verification error', {
      operation: 'checkBHYTCard',
      correlationId,
      error: err.message,
      stack: err.stack,
      duration: Date.now() - startTime,
      severity: 'high'
    });
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
      expiresAt: Date.now() + (12 * 60 * 60 * 1000) // cache 12 tiếng
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
  // Get BHYT info from session cache if available (same request flow)
    let dmBHYT = null;
    const sessionKey = `${data.BHYT || data.CCCD}_${data.HoTen}_${data.NgaySinh}`;
    if (this.sessionCache[sessionKey] && this.sessionCache[sessionKey].expiresAt > Date.now()) {
      const cachedResult = this.sessionCache[sessionKey].data;
      if (cachedResult.success && cachedResult.converted) {
        dmBHYT = cachedResult.converted;
        data.dmBHYT = dmBHYT;
      }
    }
  const lockKey = `createExam:${data.HoTen}:${data.exam_date}:${data.exam_time}:${data.IdPhongKham}`;

  // Kiểm tra xem yêu cầu đang được xử lý hay không
  if (this.sessionCache[lockKey]) {
    throw new Error('Yêu cầu đang được xử lý. Vui lòng đợi.');
  }

  // Đặt cờ để đánh dấu yêu cầu đang được xử lý
  this.sessionCache[lockKey] = { createdAt: Date.now(), expiresAt: Date.now() + 30000 };

  try {
    // Sử dụng IdPhongKham cho slot và queue logic
    const { slot, adjustedTime } = await this.getOrCreateSlot(data.exam_date, data.exam_time, data.IdPhongKham, data.role);

    // Cập nhật lại giờ khám nếu có điều chỉnh
    data.exam_time = adjustedTime;
    data.status = data.role === 'receptionist' ? 'accept' : 'pending';
    data.slotId = slot._id;
    data.IdPhongKham = slot.IdPhongKham;

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
    // Sau khi tạo QR code, luôn lưu qr_code và encoded_id vào DB
    if (data.role !== 'receptionist') {
      setImmediate(async () => {
        try {
          await healthInsuranceExamRepository.update(exam._id, {
            qr_code: qrImageBase64,
            encoded_id: encodedId
          });
          logger.info('💾 [EXAM] Đã cập nhật qr_code, encoded_id vào DB cho exam:', exam._id);
        } catch (err) {
          logger.error('❌ [EXAM] Lỗi khi cập nhật qr_code/encoded_id vào DB:', err.message);
        }
      });
    }

    
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
  } finally {
    // Xóa cờ sau khi xử lý xong
    delete this.sessionCache[lockKey];
  }
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

  if (now < examDateTime) return { success: false, message: 'Chưa tới giờ khám', data: exam };

    if ((now - examDateTime) / (1000 * 60) > 15) {
      await healthInsuranceExamRepository.updateOrderNumber(exam._id, null, 'reject');
      return { success: false, message: 'Lịch khám bị hủy do tới trễ quá 15 phút', data: exam };
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
          success: true,
          message: 'Lịch khám hợp lệ, check-in thành công. Lưu ý: Không thể đồng bộ với HIS.',
          data: exam,
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


  return { success: true, message: 'Lịch khám hợp lệ, check-in thành công', data: exam };
  }

  // Cache token HIS
  hisTokenCache = {
    access_token: null,
    expiresAt: null
  }

  // === Lấy token HIS với caching ===
  async getHISToken() {
    const correlationId = `his_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    logger.debug('Checking HIS token cache', {
      operation: 'getHISToken',
      correlationId,
      cacheExpiry: this.hisTokenCache.expiresAt ? new Date(this.hisTokenCache.expiresAt).toISOString() : null
    });

    // Kiểm tra token cache còn hạn không
    if (this.hisTokenCache.access_token && this.hisTokenCache.expiresAt > Date.now()) {
      logger.debug('Using cached HIS token', {
        operation: 'getHISToken',
        correlationId,
        source: 'cache',
        duration: Date.now() - startTime
      });
      return this.hisTokenCache.access_token;
    }

    try {
      const { API_LOGIN_HIS_333, HIS_ACCOUNT, HIS_PASSWORD, CLIENT_ID_HIS } = process.env;

      if (!API_LOGIN_HIS_333 || !HIS_ACCOUNT || !HIS_PASSWORD) {
        logger.error('HIS configuration incomplete', {
          operation: 'getHISToken',
          correlationId,
          missing: {
            api_url: !API_LOGIN_HIS_333,
            account: !HIS_ACCOUNT,
            password: !HIS_PASSWORD
          },
          severity: 'critical'
        });
        throw new Error('Thiếu thông tin cấu hình kết nối HIS');
      }

      logger.info('Requesting new HIS token', {
        operation: 'getHISToken',
        correlationId,
        endpoint: API_LOGIN_HIS_333,
        account: HIS_ACCOUNT
      });

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
      const response = await axios.post(API_LOGIN_HIS_333, params, { headers, httpsAgent: this.agent });

      logger.info('HIS token request successful', {
        operation: 'getHISToken',
        correlationId,
        statusCode: response.status,
        hasToken: !!response.data?.access_token,
        duration: Date.now() - startTime
      });

      if (!response.data || !response.data.access_token) {
        logger.error('Invalid HIS token response', {
          operation: 'getHISToken',
          correlationId,
          responseData: response.data,
          statusCode: response.status,
          severity: 'high'
        });
        throw new Error('Không nhận được access_token từ HIS');
      }

      // Cache token với thời hạn - giảm 60s để đảm bảo an toàn
      const expiresIn = response.data.expires_in || 3600; // Mặc định 1 giờ nếu không có
      this.hisTokenCache = {
        access_token: response.data.access_token,
        expiresAt: Date.now() + (expiresIn - 60) * 1000
      };

      logger.info('HIS token cached successfully', {
        operation: 'getHISToken',
        correlationId,
        expiresIn: expiresIn,
        expiresAt: new Date(this.hisTokenCache.expiresAt).toISOString(),
        duration: Date.now() - startTime,
        performance: 'success'
      });
      
      return this.hisTokenCache.access_token;

    } catch (error) {
      logger.error('HIS token request failed', {
        operation: 'getHISToken',
        correlationId,
        error: error.message,
        stack: error.stack,
        statusCode: error.response?.status,
        duration: Date.now() - startTime,
        severity: 'high'
      });
      throw new Error(`Không thể lấy token HIS: ${error.message}`);
    }
  }
  async pushToHIS(exam) {
    const correlationId = `his_push_${exam._id}_${Date.now()}`;
    const startTime = Date.now();
    
    logger.info('Starting HIS data push', {
      operation: 'pushToHIS',
      correlationId,
      examId: exam._id,
      patientName: exam.HoTen,
      examType: exam.exam_type,
      clinic: exam.IdPhongKham
    });

    try {
      // 1. Lấy token trước khi gọi API
      const token = await this.getHISToken();

      // 2. Lấy API URL từ biến môi trường
      const { API_PUSH_TO_HIS_333 } = process.env;
      if (!API_PUSH_TO_HIS_333) {
        throw new Error('Thiếu cấu hình API_PUSH_TO_HIS_333');
      }

      logger.info('🏥 [HIS] Chuẩn bị dữ liệu để gửi lên HIS');

      const PhongKham = (await import('../../models/phong-kham.model.js')).default;
      const clinic = await PhongKham.findById(exam.IdPhongKham).lean();

      let dmBHYT = null;
      if (exam.exam_type === 'BHYT') {
        if (exam.dmBHYT) {
          dmBHYT = exam.dmBHYT;
          logger.info('🏥 [HIS] Sử dụng thông tin BHYT từ exam.dmBHYT trong DB');
        } else {
          logger.info('🏥 [HIS] Không tìm thấy thông tin BHYT trong DB cho exam này');
        }
      } else {
        logger.info(`🏥 [HIS] Không tìm thông tin BHYT vì exam_type là: ${exam.exam_type}`);
      }

      // 4. Tạo payload
      const basePayload = {
        GioiTinh: exam.GioiTinh === 'Nam',
        IdDanToc: exam.IdDanToc,
        TenDanToc: exam.TenDanToc,
        IdQuocTich: exam.IdQuocTich,
        MaDoiTuongKCB:
          exam.exam_type === 'BHYT'
            ? (dmBHYT && dmBHYT.NoiDKBD === dmBHYT.Domain ? '1.1' : '3.3')
            : '9',
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
        NgayKham: this.formatDisplayDateTime(new Date()),
        NgayDonTiep: this.formatDisplayDateTime(new Date()),
        Status: 0
      };

      const payload = exam.exam_type === 'BHYT'
        ? {
          ...basePayload,
          ...(exam.dmBHYT && { DmBHYT: exam.dmBHYT }),
          IsBHYT: !!exam.dmBHYT,
          IsDungTuyen: !!exam.dmBHYT,
          SoBHYT: exam.dmBHYT ? exam.dmBHYT.SoBHYT : exam.SoBHYT,
          CMND: exam.CCCD
        }
        : basePayload;

      logger.info(`🏥 [HIS] Payload gửi lên HIS: ${JSON.stringify(payload)}`);

      // 5. Gọi API
      const response = await axios.post(API_PUSH_TO_HIS_333, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        httpsAgent: this.agent,
        timeout: 30000
      });

      logger.info('HIS API response received', {
        operation: 'pushToHIS',
        correlationId,
        examId: exam._id,
        statusCode: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        soXepHang: response.data?.SoXepHang
      });

      if (response.data && response.data.statusCode && response.data.statusCode !== 200) {
        logger.error('HIS API returned error status', {
          operation: 'pushToHIS',
          correlationId,
          examId: exam._id,
          errorCode: response.data.statusCode,
          errorDetails: response.data,
          severity: 'high'
        });
        return { success: false, error: `API HIS trả về mã lỗi: ${response.data.statusCode}`, details: response.data };
      }

      if (!response.data || (typeof response.data === 'object' && Object.keys(response.data).length === 0)) {
        logger.error('HIS API returned empty response', {
          operation: 'pushToHIS',
          correlationId,
          examId: exam._id,
          responseData: response.data,
          severity: 'high'
        });
        return { success: false, error: 'API HIS trả về dữ liệu rỗng', details: response.data };
      }

      logger.info('HIS data push successful', {
        operation: 'pushToHIS',
        correlationId,
        examId: exam._id,
        patientName: exam.HoTen,
        soXepHang: response.data.SoXepHang,
        duration: Date.now() - startTime,
        performance: 'success'
      });
      
      // Cập nhật trạng thái đã đẩy lên HIS thành công
      setImmediate(async () => {
        try {
          await healthInsuranceExamRepository.update(exam._id, { is_pushed_to_his: true });
          logger.info(`💾 [HIS] Đã cập nhật is_pushed_to_his = true cho exam: ${exam._id}`);
        } catch (err) {
          logger.error(`❌ [HIS] Lỗi khi cập nhật is_pushed_to_his: ${err.message}`);
        }
      });
      
      return { success: true, data: response.data };

    } catch (error) {
      logger.error('HIS data push failed', {
        operation: 'pushToHIS',
        correlationId,
        examId: exam._id,
        patientName: exam.HoTen,
        error: error.message,
        stack: error.stack,
        statusCode: error.response?.status,
        responseData: error.response?.data,
        duration: Date.now() - startTime,
        severity: 'high'
      });
      return { success: false, error: error.message, details: error.response?.data || {} };
    } finally {
      // Clear session cache for this patient after successful HIS push
      const sessionKey = `${exam.BHYT || exam.CCCD}_${exam.HoTen}_${exam.NgaySinh}`;
      if (this.sessionCache[sessionKey]) {
        delete this.sessionCache[sessionKey];
        logger.debug('Cleared session cache after HIS push', {
          operation: 'pushToHIS',
          correlationId,
          sessionKey: sessionKey.substring(0, 20) + '***',
          remainingCacheSize: Object.keys(this.sessionCache).length
        });
      }
    }
  }

  // === Lấy tất cả lịch khám với phân trang ===
  async getAllExams(options = {}) {
    const correlationId = `get_exams_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    logger.info('Fetching exam list', {
      operation: 'getAllExams',
      correlationId,
      filters: {
        page: options.page || 1,
        limit: options.limit || 10,
        status: options.status,
        exam_type: options.exam_type,
        clinic: options.IdPhongKham,
        exam_date: options.exam_date
      }
    });

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

      logger.info('Exam list fetched successfully', {
        operation: 'getAllExams',
        correlationId,
        resultCount: result.data.length,
        totalCount: result.total,
        page: queryOptions.page,
        limit: queryOptions.limit,
        duration: Date.now() - startTime,
        performance: result.data.length > 0 ? 'success' : 'no_results'
      });
      
      return result;

    } catch (error) {
      logger.error('Failed to fetch exam list', {
        operation: 'getAllExams',
        correlationId,
        error: error.message,
        stack: error.stack,
        duration: Date.now() - startTime,
        severity: 'medium'
      });
      throw new Error(`Không thể lấy danh sách lịch khám: ${error.message}`);
    }
  }

  // Helper method để thêm thông tin phòng khám vào danh sách lịch khám
  // === Cập nhật thông tin lịch khám ===
  async updateExam(id, data) {
    const correlationId = `update_exam_${id}_${Date.now()}`;
    const startTime = Date.now();
    
    logger.info('Starting exam update', {
      operation: 'updateExam',
      correlationId,
      examId: id,
      updateFields: Object.keys(data)
    });

    try {
      const exam = await healthInsuranceExamRepository.findById(id);
      if (!exam) {
        logger.warn('Exam not found for update', {
          operation: 'updateExam',
          correlationId,
          examId: id,
          severity: 'medium'
        });
        throw new Error('Không tìm thấy lịch khám');
      }

      // Loại bỏ các trường không được phép cập nhật
      const allowedUpdates = { ...data };
      delete allowedUpdates._id;
      delete allowedUpdates.is_deleted;
      delete allowedUpdates.created_at;
      delete allowedUpdates.updated_at;

      const updatedExam = await healthInsuranceExamRepository.update(id, allowedUpdates);

      logger.info('Exam updated successfully', {
        operation: 'updateExam',
        correlationId,
        examId: id,
        patientName: exam.HoTen,
        updatedFields: Object.keys(allowedUpdates),
        duration: Date.now() - startTime,
        performance: 'success'
      });
      
      return updatedExam;
    } catch (error) {
      logger.error('Failed to update exam', {
        operation: 'updateExam',
        correlationId,
        examId: id,
        error: error.message,
        stack: error.stack,
        duration: Date.now() - startTime,
        severity: 'medium'
      });
      throw new Error(`Không thể cập nhật lịch khám: ${error.message}`);
    }
  }

  // === Xóa lịch khám ===
  async deleteExam(id) {
    const correlationId = `delete_exam_${id}_${Date.now()}`;
    const startTime = Date.now();
    
    logger.info('Starting exam deletion', {
      operation: 'deleteExam',
      correlationId,
      examId: id
    });

    try {
      const exam = await healthInsuranceExamRepository.findById(id);
      if (!exam) {
        logger.warn('Exam not found for deletion', {
          operation: 'deleteExam',
          correlationId,
          examId: id,
          severity: 'medium'
        });
        throw new Error('Không tìm thấy lịch khám');
      }

      // Soft delete
      await healthInsuranceExamRepository.remove(id);

      logger.info('Exam deleted successfully', {
        operation: 'deleteExam',
        correlationId,
        examId: id,
        patientName: exam.HoTen,
        examDate: exam.exam_date,
        duration: Date.now() - startTime,
        performance: 'success'
      });
      
      return { success: true, message: 'Xóa lịch khám thành công' };
    } catch (error) {
      logger.error('Failed to delete exam', {
        operation: 'deleteExam',
        correlationId,
        examId: id,
        error: error.message,
        stack: error.stack,
        duration: Date.now() - startTime,
        severity: 'medium'
      });
      throw new Error(`Không thể xóa lịch khám: ${error.message}`);
    }
  }

  // === Lấy thông tin lịch khám theo ID ===
  async getExamById(id) {
    const correlationId = `get_exam_${id}_${Date.now()}`;
    const startTime = Date.now();
    
    try {
      const exam = await healthInsuranceExamRepository.findById(id);
      if (!exam) {
        logger.warn('Exam not found', {
          operation: 'getExamById',
          correlationId,
          examId: id,
          duration: Date.now() - startTime,
          severity: 'low'
        });
        throw new Error('Không tìm thấy lịch khám');
      }
      
      logger.debug('Exam retrieved successfully', {
        operation: 'getExamById',
        correlationId,
        examId: id,
        patientName: exam.HoTen,
        status: exam.status,
        duration: Date.now() - startTime
      });
      
      return exam;
    } catch (error) {
      logger.error('Failed to retrieve exam', {
        operation: 'getExamById',
        correlationId,
        examId: id,
        error: error.message,
        duration: Date.now() - startTime,
        severity: 'low'
      });
      throw new Error(`Không thể lấy lịch khám: ${error.message}`);
    }
  }
  async findOne(filter) {
    return await healthInsuranceExamRepository.findOne(filter);
  }
}

export default new HealthInsuranceExamService();
