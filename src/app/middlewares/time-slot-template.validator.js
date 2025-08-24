// Middleware validate khung giờ mẫu
export function validateTimeSlotTemplate(req, res, next) {
  const errors = [];
  const { time, capacity } = req.body;

  // Kiểm tra time định dạng hh:mm
  if (!time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    errors.push('Trường time phải đúng định dạng hh:mm (00:00 - 23:59)');
  }

  // Kiểm tra capacity
  if (typeof capacity !== 'number' || capacity <= 0) {
    errors.push('Trường capacity phải là số nguyên dương');
  }

  if (errors.length > 0) {
    return res.status(400).json({ isValid: false, errors });
  }
  next();
}
