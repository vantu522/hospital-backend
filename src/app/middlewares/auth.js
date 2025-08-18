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
