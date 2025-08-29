const validateClinicRoom = (req, res, next) => {
  const errors = [];
  const data = req.body;

  if (!data.name || !data.name.trim()) {
    errors.push('Tên phòng khám không được để trống');
  }
  if (!Array.isArray(data.rooms) || data.rooms.length === 0) {
    errors.push('Danh sách phòng phải là mảng và không được để trống');
  } else {
    // Kiểm tra từng phòng là string và không rỗng
    data.rooms.forEach((room, idx) => {
      if (typeof room !== 'string' || !room.trim()) {
        errors.push(`Phòng thứ ${idx + 1} không hợp lệ`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      isValid: false,
      errors
    });
  }
  next();
};

export default validateClinicRoom;
