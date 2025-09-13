
const validateInsuranceExam = (req, res, next) => {
  const errors = [];
  const data = req.body;

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
  if (!data.phongKham || !data.phongKham.trim()) {
    errors.push('Phòng khám không được để trống');
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
