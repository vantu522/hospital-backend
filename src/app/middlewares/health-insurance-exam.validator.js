
const validateInsuranceExam = (req, res, next) => {
  const errors = [];
  const data = req.body;

  if (!data.full_name || !data.full_name.trim()) {
    errors.push('Họ tên không được để trống');
  }
  // Số điện thoại có thể để trống, nếu có thì phải đúng định dạng
  if (data.phone_number && data.phone_number.trim() && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(data.phone_number)) {
    errors.push('Số điện thoại không đúng định dạng Việt Nam');
  }
  // if (!data.citizen_id || !data.citizen_id.trim()) {
  //   errors.push('CMND/CCCD không được để trống');
  // }
  if (!data.date_of_birth || !data.date_of_birth.trim()) {
    errors.push('Ngày sinh không được để trống');
  }
  if (!data.gender || !data.gender.trim()) {
    errors.push('Giới tính không được để trống');
  }
  if (!data.address || !data.address.trim()) {
    errors.push('Địa chỉ không được để trống');
  }
  // Số BHYT có thể để trống, không cần validate nếu trống
  if (!data.clinicRoom || !data.clinicRoom.trim()) {
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
  // Triệu chứng có thể để trống, không cần validate

  if (errors.length > 0) {
    return res.status(400).json({
      isValid: false,
      errors
    });
  }
  next();
};

export default validateInsuranceExam;
