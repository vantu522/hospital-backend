
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // lấy tất cả lỗi
      allowUnknown: true, // cho phép field không có trong schema
      stripUnknown: true, // loại bỏ field không khai báo
    });

    if (error) {
      const details = error.details.map((err) => err.message);
      return res.status(400).json({
        status: "error",
        message: "Dữ liệu không hợp lệ",
        errors: details,
      });
    }

    req.body = value; // gán lại body đã được lọc
    next();
  };
};
