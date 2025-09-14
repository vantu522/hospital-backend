import healthInsuranceExamRepository from '../repositories/health-insurance-exam.repository.js';
import axios from 'axios';
import QRCode from 'qrcode';

class HealthInsuranceExamService {
  // Cache kết quả check BHYT thành công (key: maThe)
  bhytResultCache = {};

  // Chuyển đổi dữ liệu BHYT sang format chuẩn cho API bên thứ 3
  convertBHYTToThirdParty(bhytData) {
    return {
      "Domain": "01821",
      SoBHYT: bhytData.maThe,
      HoVaTen: bhytData.hoTen,
      NgaySinh: bhytData.ngaySinh,
      GioiTinh: bhytData.gioiTinh === 'Nam',
      DiaChi: bhytData.diaChi,
      NoiDKBD: bhytData.maDKBD,
      TenBenhVienDKBD: bhytData.tenDKBDMoi || '',
      NgayDangKy: bhytData.gtTheTu,
      NgayHieuLuc: bhytData.gtTheTu,
      NgayHetHan: bhytData.gtTheDen,
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
        if (['ECONNRESET','ECONNABORTED'].includes(err.code) || err.message.includes('timeout')) {
          lastError = err;
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
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
    console.log('🔍 [BHYT_CHECK] Bắt đầu kiểm tra thẻ BHYT:', { maThe, hoTen, ngaySinh });
    
    // Log thông tin cache hiện tại trước khi kiểm tra
    console.log('🔍 [BHYT_CACHE] Trạng thái cache trước kiểm tra:');
    console.log('   - Số lượng mã thẻ trong cache:', Object.keys(this.bhytResultCache).length);
    console.log('   - Danh sách mã thẻ trong cache:', Object.keys(this.bhytResultCache));
    
    // Tham số đã dùng đúng tên tiếng Việt, không cần thay đổi
    const { BHYT_USERNAME: username, BHYT_PASSWORD: password, BHYT_HOTENCB: hoTenCb, BHYT_CCCDCB: cccdCb, BHYT_CHECK_URL: bhytCheckUrl } = process.env;
    
    if (!bhytCheckUrl) {
      console.error('❌ [BHYT_SERVICE] Missing BHYT_CHECK_URL in environment variables');
      return { success: false, message: 'Cấu hình API BHYT không đúng' };
    }
    
    console.log('🔄 [BHYT_SERVICE] Getting token...');
    let { token, id_token } = await this.getBHYTToken();
    const body = { maThe, hoTen, ngaySinh, hoTenCb, cccdCb };

    const requestAPI = async () => {
      const url = `${bhytCheckUrl}?id_token=${id_token}&password=${password}&token=${token}&username=${username}`;
      return await this.safePost(url, body);
    };

    try {
      let response = await requestAPI();

      if (response.data?.maKetQua === "401") {
        this.bhytTokenCache = { token: null, id_token: null, expiresAt: null };
        ({ token, id_token } = await this.getBHYTToken());
        await new Promise(r => setTimeout(r, 1000));
        response = await requestAPI();

        if (response.data?.maKetQua === "401") {
          return { success: false, message: response.data.ghiChu || "Token không đúng.", code: "401", data: response.data };
        }
      }

      // Chỉ có maKetQua = "000" là thành công, tất cả các mã khác đều là lỗi
      if (response.data?.maKetQua === "000") {
        // Cache kết quả convert cho maThe
        const converted = this.convertBHYTToThirdParty(response.data);
        
        // Log dữ liệu converted để debug
        console.log('✅ [BHYT_CACHE] Lưu dữ liệu vào cache cho mã thẻ:', maThe);
        console.log('✅ [BHYT_CACHE] Dữ liệu converted:', JSON.stringify(converted, null, 2));
        
        // Lưu vào cache
        this.bhytResultCache[maThe] = converted;
        
        // Log danh sách cache hiện tại
        console.log('✅ [BHYT_CACHE] Danh sách cache hiện tại:', 
          Object.keys(this.bhytResultCache).map(key => ({ key, hasData: !!this.bhytResultCache[key] })));
        
        return { success: true, data: response.data, converted };
      } else {
        return { 
          success: false, 
          message: response.data?.ghiChu || `Thẻ BHYT không hợp lệ (mã lỗi: ${response.data?.maKetQua})`, 
          code: response.data?.maKetQua,
          data: response.data 
        };
      }
    } catch (err) {
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
    
    // Cache 5 phút
    this.templatesCache = {
      data: templates,
      expiresAt: Date.now() + (5 * 60 * 1000)
    };
    
    return templates;
  }

  // === Tạo hoặc lấy slot với logic tự động tìm slot tiếp theo cho receptionist ===
  async getOrCreateSlot(exam_date, exam_time, IdPhongKham, role) {
  const ScheduleSlot = (await import('../../models/schedule-slot.model.js')).default;
  const TimeSlotTemplate = (await import('../../models/time-slot-template.model.js')).default;

  // Hàm helper để tìm khung giờ tiếp theo
  const findNextAvailableSlot = (currentTime, templates) => {
      const toMinutes = t => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const target = toMinutes(currentTime);
      
      // Tìm khung giờ tiếp theo (sau thời gian yêu cầu)
      let nextSlot = null;
      let minTimeDiff = Infinity;
      
      for (const tpl of templates) {
        const tplMinutes = toMinutes(tpl.time);
        if (tplMinutes > target && (tplMinutes - target) < minTimeDiff) {
          minTimeDiff = tplMinutes - target;
          nextSlot = tpl;
        }
      }
      
      // ✅ Chỉ tìm khung giờ sau thời gian yêu cầu, không fallback về đầu
      if (!nextSlot) {
        return null; // Không tìm thấy khung giờ nào phù hợp
      }
      
      return nextSlot;
    };


    let template = await TimeSlotTemplate.findOne({ time: exam_time, is_active: true }).lean();
    let adjustedTime = exam_time;

    // Lấy cached templates để tái sử dụng và giảm DB load
    const allTemplates = await this.getTemplatesCache();

    if (allTemplates.length === 0) {
      throw new Error('Không có khung giờ mẫu nào đang hoạt động');
    }

    // ✅ Logic xử lý theo role
    if (!template) {
      if (role === 'receptionist') {
        // Receptionist: Tự động tìm khung giờ tiếp theo
        const foundTemplate = findNextAvailableSlot(exam_time, allTemplates);
        if (!foundTemplate) {
          throw new Error('Không tìm thấy khung giờ mẫu nào phù hợp');
        }
        template = foundTemplate;
        adjustedTime = template.time;
      } else {
        // User: Báo lỗi nếu không có khung giờ mẫu chính xác
        throw new Error(`Khung giờ ${exam_time} không có trong lịch khám. Vui lòng chọn khung giờ khác.`);
      }
    }

    // Logic tự động tìm slot trống cho receptionist - batch check
    let slot = null;

    // Pre-check 5 slots cùng lúc để tối ưu
    const slotsToCheck = [];
    let currentTime = adjustedTime;
    let currentTemplate = template;

    for (let i = 0; i < 5; i++) {
      slotsToCheck.push({
        date: exam_date,
        timeSlot: currentTime,
        IdPhongKham: IdPhongKham, 
        template: currentTemplate
      });

      if (i < 4) {
        const nextTemplate = findNextAvailableSlot(currentTime, allTemplates);
        if (!nextTemplate) break;
        currentTime = nextTemplate.time;
        currentTemplate = nextTemplate;
      }
    }

    // Batch query để check tất cả slots cùng lúc
    const existingSlots = await ScheduleSlot.find({
      date: exam_date,
      timeSlot: { $in: slotsToCheck.map(s => s.timeSlot) },
      IdPhongKham: IdPhongKham
    }).lean();

    // Tìm slot có thể sử dụng
    for (const slotInfo of slotsToCheck) {
      const existingSlot = existingSlots.find(s => s.timeSlot === slotInfo.timeSlot);

      // Nếu slot chưa tồn tại, tạo mới
      if (!existingSlot) {
        try {
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
          if (err.code === 11000) continue;
          throw err;
        }
      }

      // Nếu slot còn chỗ trống
      if (existingSlot.currentCount < existingSlot.capacity) {
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
      throw new Error('Không tìm thấy khung giờ trống nào trong ngày');
    }

    return {
      slot,
      adjustedTime
    };
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

    // Lấy order number TRƯỚC khi tạo exam nếu status là accept
    if (data.status === 'accept') {
      const maxOrder = await healthInsuranceExamRepository.findMaxOrderNumber(data.exam_date);
      data.order_number = maxOrder + 1;
    }

    // Parallel operations sau khi đã có order_number
    const [exam, phongKhamObj] = await Promise.all([
      healthInsuranceExamRepository.create(data),
      (async () => {
        const PhongKham = (await import('../../models/phong-kham.model.js')).default;
        return PhongKham.findOne({ _id: data.IdPhongKham }, 'ten').lean();
      })()
    ]);

    // Nếu status là accept (role là receptionist), đẩy ngay lên HIS và đợi kết quả
    if (data.status === 'accept') {
      console.log('🏥 [HIS] Đẩy dữ liệu lên HIS cho bản ghi có status accept');
      
      // Đợi kết quả từ HIS
      const hisResult = await this.pushToHIS(exam);
      
      // Nếu không thành công, trả về lỗi
      if (!hisResult.success) {
        // Lấy thông tin lỗi chi tiết từ kết quả
        const errorDetails = hisResult.details && Object.keys(hisResult.details).length > 0 
          ? JSON.stringify(hisResult.details) 
          : hisResult.error;
        
        throw new Error(`Không thể đẩy dữ liệu lên HIS: ${errorDetails}`);
      }
      
      console.log('✅ [HIS] Đẩy dữ liệu lên HIS thành công');
    }

    const encodedId = Buffer.from(exam._id.toString()).toString('base64');
    const qrImageBase64 = await QRCode.toDataURL(encodedId);

    return {
      exam: {
        ...exam.toObject(),
        IdPhongKham: exam.IdPhongKham, // id
        clinic: phongKhamObj?.ten || '' // top-level field
      },
      qr_code: qrImageBase64,
      encoded_id: encodedId
    };
  }

  // === Check lịch khám theo QR code với parallel operations ===
  async checkExamByEncodedId(encodedId) {
    let id;
    try { id = Buffer.from(encodedId, 'base64').toString('utf-8'); } 
    catch { throw new Error('QR code không hợp lệ'); }

    const exam = await healthInsuranceExamRepository.findById(id);
    if (!exam) throw new Error('Không tìm thấy lịch khám');

    const now = new Date();
    const [h,m] = exam.exam_time.split(':').map(Number);
    const examDateTime = new Date(exam.exam_date); examDateTime.setHours(h,m,0,0);

    if (now < examDateTime) return { valid: false, message: 'Chưa tới giờ khám', exam };

    if ((now - examDateTime)/(1000*60) > 15) {
      // Atomic update để reject exam
      await healthInsuranceExamRepository.updateOrderNumber(exam._id, null, 'reject');
      return { valid: false, message: 'Lịch khám bị hủy do tới trễ quá 15 phút', exam };
    }

    if (exam.status !== 'accept') {
      // Lấy max order number trước - lọc theo ngày hiện tại
      const today = new Date();
      today.setHours(0,0,0,0);
      const maxOrder = await healthInsuranceExamRepository.findMaxOrderNumber(today);
      const newOrderNumber = maxOrder + 1;
      
      // Update exam với order number và status
      const updatedExam = await healthInsuranceExamRepository.updateOrderNumber(exam._id, newOrderNumber, 'accept');
      
      // Cập nhật object exam để trả về đúng
      exam.status = 'accept';
      exam.order_number = newOrderNumber;
      
      // Đẩy lên HIS ngay sau khi update status thành accept và đợi kết quả
      console.log('🏥 [HIS] Đẩy dữ liệu lên HIS sau khi update status');
      const hisResult = await this.pushToHIS(updatedExam);
      
      if (!hisResult.success) {
        // Log lỗi nhưng vẫn cho phép check-in thành công vì đã cập nhật status và order_number
        console.error('❌ [HIS] Lỗi khi đẩy dữ liệu lên HIS sau khi update status:', 
          hisResult.details ? JSON.stringify(hisResult.details) : hisResult.error);
        
        // Vẫn cho phép check-in thành công nhưng thêm thông tin lỗi
        return { 
          valid: true, 
          message: 'Lịch khám hợp lệ, check-in thành công. Lưu ý: Không thể đồng bộ với HIS.', 
          exam,
          warning: 'Không thể đồng bộ dữ liệu với HIS. Vui lòng kiểm tra lại sau.'
        };
      }
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
    console.log('🔑 [HIS] Kiểm tra token HIS');
    
    // Kiểm tra token cache còn hạn không
    if (this.hisTokenCache.access_token && 
        this.hisTokenCache.expiresAt > Date.now()) {
      console.log('🔑 [HIS] Sử dụng token HIS đã cache');
      return this.hisTokenCache.access_token;
    }
    
    try {
      const { API_LOGIN_HIS_URL, HIS_ACCOUNT, HIS_PASSWORD, CLIENT_ID_HIS } = process.env;
      
      if (!API_LOGIN_HIS_URL || !HIS_ACCOUNT || !HIS_PASSWORD) {
        throw new Error('Thiếu thông tin cấu hình kết nối HIS');
      }
      
      console.log('🔑 [HIS] Đang lấy token mới từ:', API_LOGIN_HIS_URL);
      
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
      
      // Gửi request với params
      const response = await axios.post(API_LOGIN_HIS_URL, params, { headers });
      
      console.log('✅ [HIS] Nhận phản hồi từ server HIS:', response.status);
      
      if (!response.data || !response.data.access_token) {
        console.error('❌ [HIS] Phản hồi không có access_token:', response.data);
        throw new Error('Không nhận được access_token từ HIS');
      }
      
      // Cache token với thời hạn - giảm 60s để đảm bảo an toàn
      const expiresIn = response.data.expires_in || 3600; // Mặc định 1 giờ nếu không có
      this.hisTokenCache = {
        access_token: response.data.access_token,
        expiresAt: Date.now() + (expiresIn - 60) * 1000
      };
      
      console.log('🔑 [HIS] Đã lấy được token HIS mới, hết hạn sau:', expiresIn, 'giây');
      return this.hisTokenCache.access_token;
      
    } catch (error) {
      console.error('❌ [HIS] Lỗi khi lấy token HIS:', error.message);
      throw new Error(`Không thể lấy token HIS: ${error.message}`);
    }
  }
  async pushToHIS(exam) {
    console.log('🏥 [HIS] Đẩy thông tin lên HIS:', exam._id);
    try {
      // 1. Lấy token trước khi gọi API
      const token = await this.getHISToken();
      
      // 2. Lấy API URL từ biến môi trường
      const { API_PUSH_TO_HIS_URL } = process.env;
      if (!API_PUSH_TO_HIS_URL) {
        throw new Error('Thiếu cấu hình API_PUSH_TO_HIS_URL');
      }
      
      console.log('🏥 [HIS] Chuẩn bị dữ liệu để gửi lên HIS');
      
      // Định dạng ngày giờ cho tất cả các trường ngày tháng
      // FORMAT: HH:MM mm/dd/yyyy (giờ:phút tháng/ngày/năm) theo yêu cầu API HIS
      // Ngày sinh chỉ cần dạng mm/dd/yyyy (không cần giờ)
      const formatDisplayDateTime = (date, showTimeComponent = true) => {
        if (!date) return '';
        try {
          const d = date instanceof Date ? date : new Date(date);
          if (isNaN(d.getTime())) return '';
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const year = d.getFullYear();
          
          // Nếu không cần hiển thị giờ (chỉ ngày), trả về định dạng MM/DD/YYYY
          if (!showTimeComponent) {
            return `${month}/${day}/${year}`;
          }
          
          // Nếu cần hiển thị cả giờ, trả về định dạng HH:MM MM/DD/YYYY
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes} ${month}/${day}/${year}`;
        } catch {
          return '';
        }
      };
      
      // Lấy phòng khám
      const PhongKham = (await import('../../models/phong-kham.model.js')).default;
      const clinic = await PhongKham.findById(exam.IdPhongKham).lean();
      
      // Lấy thông tin BHYT từ cache nếu có và chỉ khi type là BHYT
      let dmBHYT = null;
      
      // Lưu BHYT và CCCD keys để xử lý cache sau khi push lên HIS
      const bhytKey = exam.BHYT;
      const cccdKey = exam.CCCD;
      
      // Chỉ tìm thông tin BHYT khi exam_type là 'BHYT'
      if (exam.exam_type === 'BHYT') {
        // Log thông tin về cache BHYT hiện tại
        console.log('🔍 [BHYT_CACHE] Thông tin cache BHYT hiện tại:');
        console.log('   - Tổng số cache:', Object.keys(this.bhytResultCache).length);
        console.log('   - Các khóa có trong cache:', Object.keys(this.bhytResultCache));
        
        console.log('   - Đang tìm mã thẻ BHYT:', bhytKey);
        console.log('   - Đang tìm mã CCCD:', cccdKey);
        console.log('   - BHYT có tồn tại trong cache:', !!this.bhytResultCache[bhytKey]);
        console.log('   - CCCD có tồn tại trong cache:', !!this.bhytResultCache[cccdKey]);
        
        // Kiểm tra trường BHYT trước
        if (bhytKey && this.bhytResultCache[bhytKey]) {
          try {
            // Lấy dữ liệu từ cache và đảm bảo nó là đối tượng hợp lệ
            const cachedData = this.bhytResultCache[bhytKey];
            
            console.log('🔍 [BHYT_CACHE] Dữ liệu cache tìm thấy từ BHYT:', JSON.stringify(cachedData, null, 2));
            
            // Kiểm tra xem dữ liệu có phải là đối tượng và có thuộc tính cần thiết không
            if (cachedData && typeof cachedData === 'object' && cachedData.SoBHYT && cachedData.HoVaTen) {
              dmBHYT = cachedData;
              console.log('🏥 [HIS] Sử dụng thông tin BHYT từ cache (mã BHYT):', bhytKey);
            } else {
              console.warn('🏥 [HIS] Dữ liệu BHYT cache không đúng định dạng, bỏ qua');
              console.warn('🏥 [HIS] Chi tiết dữ liệu:', 
                cachedData ? `Loại: ${typeof cachedData}, Có SoBHYT: ${!!cachedData.SoBHYT}, Có HoVaTen: ${!!cachedData.HoVaTen}` : 'null');
            }
          } catch (error) {
            console.error('❌ [HIS] Lỗi khi xử lý dữ liệu BHYT từ cache (mã BHYT):', error.message);
          }
        } 
        
        // Nếu không tìm thấy từ BHYT, thử tìm từ CCCD
        if (!dmBHYT && cccdKey && this.bhytResultCache[cccdKey]) {
          try {
            // Lấy dữ liệu từ cache và đảm bảo nó là đối tượng hợp lệ
            const cachedData = this.bhytResultCache[cccdKey];
            
            console.log('🔍 [BHYT_CACHE] Dữ liệu cache tìm thấy từ CCCD:', JSON.stringify(cachedData, null, 2));
            
            // Kiểm tra xem dữ liệu có phải là đối tượng và có thuộc tính cần thiết không
            if (cachedData && typeof cachedData === 'object' && cachedData.SoBHYT && cachedData.HoVaTen) {
              dmBHYT = cachedData;
              console.log('🏥 [HIS] Sử dụng thông tin BHYT từ cache (mã CCCD):', cccdKey);
            } else {
              console.warn('🏥 [HIS] Dữ liệu BHYT cache từ CCCD không đúng định dạng, bỏ qua');
            }
          } catch (error) {
            console.error('❌ [HIS] Lỗi khi xử lý dữ liệu BHYT từ cache (mã CCCD):', error.message);
          }
        }
        
        // Nếu vẫn không tìm thấy, log thông báo
        if (!dmBHYT && (bhytKey || cccdKey)) {
          console.log('🏥 [HIS] Không tìm thấy thông tin BHYT trong cache cho cả BHYT và CCCD');
          console.log('🏥 [HIS] Các mã thẻ hiện có trong cache:', Object.keys(this.bhytResultCache).join(', ') || 'Không có');
        }
      } else {
        console.log('🏥 [HIS] Không tìm thông tin BHYT vì exam_type là:', exam.exam_type);
      }
      
      // 4. Cấu trúc dữ liệu theo yêu cầu của API HIS
      const basePayload = {
        GioiTinh: exam.GioiTinh === 'Nam',
        IdDanToc: exam.IdDanToc || "5cdeb1cd-bd45-4846-ae11-222fd111415c",
        TenDanToc: exam.TenDanToc || "Thái",
        IdQuocTich: exam.IdQuocTich || "e28c648f-be25-4597-90ce-7ec40031625e",
        MaDoiTuongKCB: exam.exam_type === 'BHYT' ? "3.3" : "9",
        MaTinh: exam.MaTinh || "01",
        TenTinh: exam.TenTinh || "Thành phố Hà Nội",
        IdTinhThanh: exam.IdTinhThanh || "746df3a2-6488-4cd4-8ec9-0fc21d497ca9",
        IdXaPhuong: exam.IdXaPhuong || "a99edb8e-99cd-46fc-a931-850b7caa749e",
        IdBenhVien: "5f2a991f-a74a-4d71-b183-5d18919d0957",
        IdKhoaKham: exam.IdKhoaKham || "43871a8e-9d9f-4672-91aa-ab6ce2526c7b",
        IsDonTiepCCCD: !!exam.CCCD,
        MaXa: exam.MaXa || "00118",
        TenXa: exam.TenXa || "Phường Bồ Đề",
        MaPhongKham: exam.MaPhongKham || "K02.03.A",
        TenPhongKham: exam.TenPhongKham || "Phòng Khám Đái Tháo Đường 236A",
        IdPhongKham: exam.IdPhongKham || "13e4be91-38ff-4403-b07a-912e7995a259",
        IdLoaiKham: exam.IdLoaiKham || "fc8dba41-634a-4ec6-9451-c23106dc813a",
        HoTen: exam.HoTen,
        DienThoai: exam.DienThoai,
        SoNha: exam.SoNha || "236A",
        IdNgheNghiep: exam.IdNgheNghiep || "f39d6834-74a5-4aac-8603-2a26ab002023",
        TenNgheNghiep: exam.TenNgheNghiep || "Khác",
        NgaySinh: formatDisplayDateTime(exam.NgaySinh, false),
        DiaChi: exam.DiaChi,
        IdCanBoDonTiep: "3923362b-5ec4-4d11-ae0f-684001f67748",
        NgayKham: formatDisplayDateTime(new Date()),
        NgayDonTiep: formatDisplayDateTime(new Date()),
        Status: 0
      };
      
      // Nếu là BHYT, thêm các trường bổ sung
      const payload = exam.exam_type === 'BHYT' 
        ? {
            ...basePayload,
            // Thông tin BHYT chỉ được thêm khi có dữ liệu hợp lệ
            ...(dmBHYT && { DmBHYT: dmBHYT }),
            // Thêm các trường bắt buộc cho BHYT
            IsBHYT: !!dmBHYT,
            IsDungTuyen: !!dmBHYT,
            SoBHYT: dmBHYT ? dmBHYT.SoBHYT : exam.SoBHYT || '',
            CMND: exam.CCCD,
            IdCongKhamBanDau: exam.IdCongKhamBanDau || "a9e068e7-1df4-4711-928e-30e9ed18502b",
            IsDatKhamTuXa: false,
          }
        : basePayload; // Nếu là DV, chỉ dùng các trường cơ bản
      
      // Log đầy đủ payload để debug
      console.log('🏥 [HIS] Chi tiết payload gửi lên HIS:', JSON.stringify(payload, null, 2));
      
      
      // 5. Gọi API với token trong header
      const response = await axios.post(API_PUSH_TO_HIS_URL, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ [HIS] Phản hồi từ API HIS:', response.status, response.statusText);
      console.log('✅ [HIS] Đẩy thông tin lên HIS thành công:', exam._id);
      
      // 6. Trả về kết quả
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // Log lỗi ngắn gọn nhưng đầy đủ thông tin quan trọng
      console.error(`❌ [HIS] Lỗi: ${error.message} | Bệnh nhân: ${exam.HoTen} (ID: ${exam._id})`);
      
      // Log dữ liệu response lỗi từ server nếu có
      if (error.response?.data) {
        console.error('❌ [HIS] Data lỗi:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Không throw lỗi ở đây để không ảnh hưởng đến luồng chính
      return {
        success: false,
        error: error.message,
        details: error.response?.data || {}
      };
    } finally {
      // Xóa cache BHYT sau khi đẩy lên HIS (thành công hoặc thất bại)
      const bhytKey = exam.BHYT;
      const cccdKey = exam.CCCD;
      
      if (bhytKey || cccdKey) {
        if (bhytKey && this.bhytResultCache[bhytKey]) {
          delete this.bhytResultCache[bhytKey];
          console.log('🧹 [BHYT_CACHE] Đã xóa cache BHYT sau khi push lên HIS:', bhytKey);
        }
        
        if (cccdKey && this.bhytResultCache[cccdKey]) {
          delete this.bhytResultCache[cccdKey];
          console.log('🧹 [BHYT_CACHE] Đã xóa cache CCCD sau khi push lên HIS:', cccdKey);
        }
        
        console.log('🧹 [BHYT_CACHE] Số lượng mã thẻ còn lại trong cache:', Object.keys(this.bhytResultCache).length);
      }
    }
  }
}

export default new HealthInsuranceExamService();
