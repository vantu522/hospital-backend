
const validateInsuranceExam = (req, res, next) => {
  const errors = [];
  const data = req.body;

  // Xử lý định dạng ngày tháng trước khi validate
  try {
    // Chuyển đổi NgaySinh từ dd/mm/yyyy sang định dạng ISO Date nếu cần
    if (data.NgaySinh && typeof data.NgaySinh === 'string') {
      if (data.NgaySinh.includes('/')) {
        // Định dạng dd/mm/yyyy
        const [day, month, year] = data.NgaySinh.split('/');
        // Tạo date string định dạng ISO: YYYY-MM-DD
        data.NgaySinh = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    // Chuyển đổi exam_date từ dd/mm/yyyy sang định dạng ISO Date nếu cần
    if (data.exam_date && typeof data.exam_date === 'string') {
      if (data.exam_date.includes('/')) {
        // Định dạng dd/mm/yyyy
        const [day, month, year] = data.exam_date.split('/');
        // Tạo date string định dạng ISO: YYYY-MM-DD
        data.exam_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  } catch (error) {
    errors.push('Lỗi định dạng ngày tháng: ' + error.message);
  }

  // Cơ bản
  if (!data.HoTen || !data.HoTen.trim()) {
    errors.push('Họ tên không được để trống');
  }
  // Số điện thoại là bắt buộc và phải đúng định dạng
  if (!data.DienThoai || !data.DienThoai.trim()) {
    errors.push('Số điện thoại không được để trống');
  } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(data.DienThoai)) {
    errors.push('Số điện thoại không đúng định dạng Việt Nam');
  }
  // CCCD có thể được kiểm tra trong điều kiện IsDonTiepCCCD
  if (!data.NgaySinh || !data.NgaySinh.trim()) {
    errors.push('Ngày sinh không được để trống');
  }
  if (!data.GioiTinh || !data.GioiTinh.trim()) {
    errors.push('Giới tính không được để trống');
  }
  if (!data.DiaChi || !data.DiaChi.trim()) {
    errors.push('Địa chỉ không được để trống');
  }
  // Số BHYT có thể để trống, không cần validate nếu trống
  
  // Thông tin phòng khám
  if (!data.IdPhongKham || !data.IdPhongKham.trim()) {
    errors.push('ID phòng khám không được để trống');
  }
  if (!data.MaPhongKham || !data.MaPhongKham.trim()) {
    errors.push('Mã phòng khám không được để trống');
  }
  if (!data.TenPhongKham || !data.TenPhongKham.trim()) {
    errors.push('Tên phòng khám không được để trống');
  }
  
  // Thông tin loại khám
  if (!data.IdLoaiKham || !data.IdLoaiKham.trim()) {
    errors.push('ID loại khám không được để trống');
  }
  
  // Thông tin địa chỉ
  if (!data.MaTinh || !data.MaTinh.trim()) {
    errors.push('Mã tỉnh không được để trống');
  }
  if (!data.TenTinh || !data.TenTinh.trim()) {
    errors.push('Tên tỉnh không được để trống');
  }
  if (!data.IdTinhThanh || !data.IdTinhThanh.trim()) {
    errors.push('ID tỉnh thành không được để trống');
  }
  if (!data.MaXa || !data.MaXa.trim()) {
    errors.push('Mã xã không được để trống');
  }
  if (!data.TenXa || !data.TenXa.trim()) {
    errors.push('Tên xã không được để trống');
  }
  if (!data.IdXaPhuong || !data.IdXaPhuong.trim()) {
    errors.push('ID xã phường không được để trống');
  }
  
  // Thông tin khác
  if (!data.IdDanToc || !data.IdDanToc.trim()) {
    errors.push('ID dân tộc không được để trống');
  }
  if (!data.TenDanToc || !data.TenDanToc.trim()) {
    errors.push('Tên dân tộc không được để trống');
  }
  if (!data.IdQuocTich || !data.IdQuocTich.trim()) {
    errors.push('ID quốc tịch không được để trống');
  }
  if (!data.IdKhoaKham || !data.IdKhoaKham.trim()) {
    errors.push('ID khoa khám không được để trống');
  }
  if (!data.IdNgheNghiep || !data.IdNgheNghiep.trim()) {
    errors.push('ID nghề nghiệp không được để trống');
  }
  if (!data.TenNgheNghiep || !data.TenNgheNghiep.trim()) {
    errors.push('Tên nghề nghiệp không được để trống');
  }
  if (!data.IdCanBoDonTiep || !data.IdCanBoDonTiep.trim()) {
    errors.push('ID cán bộ đón tiếp không được để trống');
  }
  if (!data.IdBenhVien || !data.IdBenhVien.trim()) {
    errors.push('ID bệnh viện không được để trống');
  }
  
  if (!data.exam_date || !data.exam_date.trim()) {
    errors.push('Ngày khám không được để trống');
  }
  if (!data.exam_time || !data.exam_time.trim()) {
    errors.push('Giờ khám không được để trống');
  }
  // Email có thể để trống, nếu có thì phải đúng định dạng
  if (data.email && data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email không hợp lệ');
  }
  if(data.IsDonTiepCCCD) {
    if (!data.CCCD || !data.CCCD.trim()) {
      errors.push('CCCD không được để trống khi chọn đơn tiếp CCCD');
    }
  }
  if (errors.length > 0) {
    return res.status(400).json({
      isValid: false,
      errors
    });
  }
  next();
};

export default validateInsuranceExam;
