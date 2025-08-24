// Middleware gán role vào req, không bắt buộc phải có token
export const attachRole = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.role = decoded.role;
    } else {
      req.role = 'user';
    }
  } catch (error) {
    req.role = 'user';
  }
  next();
};
// Hàm generateToken dùng chung cho user và customer
export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION_IN || '7d' });
}
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/constants.js';

// Middleware kiểm tra role
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Access token không được cung cấp' });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.role = decoded.role;
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
      }
      next();
    } catch (error) {
      return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  };
};

// Middleware chỉ admin
export const requireSuperAdmin = requireRole(['superadmin']);
export const requireAdminOrSuperadmin = requireRole(['admin', 'superadmin']);
export const requiredFullRole = requireRole(['admin', 'superadmin', 'user', 'receptionist']);
