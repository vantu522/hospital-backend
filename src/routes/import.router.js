import express from 'express';
import multer from 'multer';
import importController from '../app/controllers/import.controller.js';
import { requireAdminOrSuperadmin } from '../app/middlewares/auth.js';

const router = express.Router();

// Cấu hình multer để upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.xlsx');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép file Excel
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  }
});

// Routes cho import (chỉ admin/superadmin)
router.post('/khoa-kham',  upload.single('file'), importController.importKhoaKham);
router.post('/phong-kham', upload.single('file'), importController.importPhongKham);
router.post('/loai-kham',  upload.single('file'), importController.importLoaiKham);
router.post('/cong-kham',  upload.single('file'), importController.importCongKham);
// Routes cho download template (chỉ admin/superadmin)
router.get('/khoa-kham/template', requireAdminOrSuperadmin, importController.downloadKhoaKhamTemplate);
router.get('/phong-kham/template', requireAdminOrSuperadmin, importController.downloadPhongKhamTemplate);

export default router;
