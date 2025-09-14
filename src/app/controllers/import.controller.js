import xlsx from 'xlsx';
import fs from 'fs';
import KhoaKham from '../../models/khoa-kham.model.js';
import PhongKham from '../../models/phong-kham.model.js';
import LoaiKham from '../../models/loai-kham.model.js';
import CongKham from '../../models/cong-kham.model.js';

class ImportController {
  /**
   * @swagger
   * /api/import/khoa-kham:
   *   post:
   *     tags: [Import]
   *     summary: Import dữ liệu khoa khám từ file Excel
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: File Excel (.xlsx hoặc .xls)
   *             required:
   *               - file
   *     responses:
   *       200:
   *         description: Import thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Import KhoaKham thành công
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalImported:
   *                       type: integer
   *                     records:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/KhoaKham'
   */
  async importKhoaKham(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file Excel để import'
        });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!sheetData || sheetData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File Excel không có dữ liệu'
        });
      }

      const docs = sheetData.map((row, index) => {
        const id = row["ID"];
        const ma = row["Mã"];
        const ten = row["Tên"];
        const diaChi = row["Địa chỉ"];
        const capQuanLi = row["Cấp quản lý"];

        if (!id || !ma || !ten) {
          throw new Error(`Dòng ${index + 2}: Thiếu thông tin ID, Mã hoặc Tên`);
        }

        return {
          _id: id.toString().trim(),
          ma: ma.toString().trim().toUpperCase(),
          ten: ten.toString().trim(),
          dia_chi: diaChi ? diaChi.toString().trim() : '',
          cap_quan_li: capQuanLi ? capQuanLi.toString().trim() : 'Khoa',
          is_active: true
        };
      });

      const result = await KhoaKham.insertMany(docs, { ordered: false });
      fs.unlinkSync(req.file.path);

      return res.status(200).json({
        success: true,
        message: 'Import KhoaKham thành công',
        data: { totalImported: result.length, records: result }
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Import KhoaKham error:', error);
      let statusCode = 500;
      let message = error.message;

      if (error.code === 11000) {
        statusCode = 400;
        message = 'Có dữ liệu trùng lặp trong file Excel hoặc database';
      } else if (error.message.includes('Dòng')) {
        statusCode = 400;
      }

      return res.status(statusCode).json({
        success: false,
        message: `Lỗi import KhoaKham: ${message}`
      });
    }
  }

  /**
   * @swagger
   * /api/import/phong-kham:
   *   post:
   *     tags: [Import]
   *     summary: Import dữ liệu phòng khám từ file Excel
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: File Excel (.xlsx hoặc .xls)
   *             required:
   *               - file
   *     responses:
   *       200:
   *         description: Import thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Import PhongKham thành công
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalImported:
   *                       type: integer
   *                     records:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/PhongKham'
   */
  async importPhongKham(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file Excel để import'
        });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!sheetData || sheetData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File Excel không có dữ liệu'
        });
      }

      const docs = sheetData.map((row, index) => {
        const id = row["ID"];
        const ma = row["Mã"];
        const ten = row["Tên"];
        const diaChi = row["Địa chỉ"];
        const capQuanLi = row["Cấp quản lý"];
        const idKhoaKham = row["Mã Khoa Khám"];
        const idCongKhamBanDau = row["Mã Cổng Khám Ban Đầu"];
        const idLoaiKham = row["Mã Loại Khám"];
      

        if (!id || !ma || !ten || !idKhoaKham || !idLoaiKham) {
          throw new Error(`Dòng ${index + 2}: Thiếu thông tin ID, Mã, Tên, Mã Khoa Khám hoặc Mã Loại Khám`);
        }

        return {
          _id: id.toString().trim(),
          ma: ma.toString().trim().toUpperCase(),
          ten: ten.toString().trim(),
          dia_chi: diaChi ? diaChi.toString().trim() : '',
          cap_quan_li: capQuanLi ? capQuanLi.toString().trim() : 'Phòng',
          IdKhoaKham: idKhoaKham.toString().trim(),
          IdLoaiKham: idLoaiKham.toString().trim(),
          IdCongKhamBanDau: idCongKhamBanDau ? idCongKhamBanDau.toString().trim() : null,
          is_active: true
        };
      });

      const result = await PhongKham.insertMany(docs, { ordered: false });
      fs.unlinkSync(req.file.path);

      return res.status(200).json({
        success: true,
        message: 'Import PhongKham thành công',
        data: { totalImported: result.length, records: result }
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Import PhongKham error:', error);
      let statusCode = 500;
      let message = error.message;

      if (error.code === 11000) {
        statusCode = 400;
        message = 'Có dữ liệu trùng lặp trong file Excel hoặc database';
      } else if (error.message.includes('Dòng')) {
        statusCode = 400;
      }

      return res.status(statusCode).json({
        success: false,
        message: `Lỗi import PhongKham: ${message}`
      });
    }
  }

  /**
   * @swagger
   * /api/import/loai-kham:
   *   post:
   *     tags: [Import]
   *     summary: Import dữ liệu loại khám từ file Excel
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: File Excel (.xlsx hoặc .xls)
   *             required:
   *               - file
   *     responses:
   *       200:
   *         description: Import thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Import LoaiKham thành công
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalImported:
   *                       type: integer
   *                     records:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/LoaiKham'
   */
  async importLoaiKham(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file Excel để import'
        });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!sheetData || sheetData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File Excel không có dữ liệu'
        });
      }

      const docs = sheetData.map((row, index) => {
        const id = row["Id"];
        const ma = row["Mã"];
        const ten = row["Tên"];

        if (!id || !ma || !ten) {
          throw new Error(`Dòng ${index + 2}: Thiếu thông tin ID, Mã hoặc Tên`);
        }

        return {
          _id: id.toString().trim(),
          ma: ma.toString().trim().toUpperCase(),
          ten: ten.toString().trim(),
          is_active: true
        };
      });

      const result = await LoaiKham.insertMany(docs, { ordered: false });
      fs.unlinkSync(req.file.path);

      return res.status(200).json({
        success: true,
        message: 'Import LoaiKham thành công',
        data: { totalImported: result.length, records: result }
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Import LoaiKham error:', error);
      let statusCode = 500;
      let message = error.message;

      if (error.code === 11000) {
        statusCode = 400;
        message = 'Có dữ liệu trùng lặp trong file Excel hoặc database';
      } else if (error.message.includes('Dòng')) {
        statusCode = 400;
      }

      return res.status(statusCode).json({
        success: false,
        message: `Lỗi import LoaiKham: ${message}`
      });
    }
  }

  /**
   * @swagger
   * /api/import/cong-kham:
   *   post:
   *     tags: [Import]
   *     summary: Import dữ liệu cổng khám từ file Excel
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: File Excel (.xlsx hoặc .xls)
   *             required:
   *               - file
   *     responses:
   *       200:
   *         description: Import thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Import CongKham thành công
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalImported:
   *                       type: integer
   *                     records:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/CongKham'
   */
  async importCongKham(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file Excel để import'
        });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!sheetData || sheetData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File Excel không có dữ liệu'
        });
      }

      const docs = sheetData.map((row, index) => {
        // Chuẩn hóa key để tránh khoảng trắng
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          normalizedRow[key.trim()] = row[key];
        });

        const id = normalizedRow["Id"];
        const ma_bv = normalizedRow["Mã BV"];
        const ma_bhyt = normalizedRow["Mã BHYT"];
        const ten_bv = normalizedRow["Tên BV"];
        const ten_bhyt = normalizedRow["Tên BHYT"];

        if (!id || !ma_bv || !ma_bhyt || !ten_bv || !ten_bhyt) {
          throw new Error(`Dòng ${index + 2}: Thiếu dữ liệu bắt buộc`);
        }

        return {
          _id: id.toString().trim(),
          ma_bv: ma_bv.toString().trim(),
          ma_bhyt: ma_bhyt.toString().trim(),
          ten_bv: ten_bv.toString().trim(),
          ten_bhyt: ten_bhyt.toString().trim(),
          is_active: true
        };
      });

      const result = await CongKham.insertMany(docs, { ordered: false });
      fs.unlinkSync(req.file.path);

      return res.status(200).json({
        success: true,
        message: 'Import Công khám thành công',
        data: { totalImported: result.length, records: result }
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Import CongKham error:', error);
      let statusCode = 500;
      let message = error.message;

      if (error.code === 11000) {
        statusCode = 400;
        message = 'Có dữ liệu trùng lặp trong file Excel hoặc database';
      } else if (error.message.includes('Dòng')) {
        statusCode = 400;
      }

      return res.status(statusCode).json({
        success: false,
        message: `Lỗi import CongKham: ${message}`
      });
    }
  }

  /**
   * @swagger
   * /api/import/khoa-kham/template:
   *   get:
   *     tags: [Import]
   *     summary: Tải template Excel cho khoa khám
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: File template
   *         content:
   *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
   *             schema:
   *               type: string
   *               format: binary
   */
  async downloadKhoaKhamTemplate(req, res) {
    try {
      const templateData = [
        {
          "ID": "KHOA001",
          "Mã": "KHNT",
          "Tên": "Khoa Nội Tổng Hợp",
          "Địa chỉ": "Tầng 2 - Khu A",
          "Cấp quản lý": "Khoa"
        }
      ];

      const ws = xlsx.utils.json_to_sheet(templateData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "KhoaKham");

      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=template-khoa-kham.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Download KhoaKham template error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải template KhoaKham'
      });
    }
  }

  /**
   * @swagger
   * /api/import/phong-kham/template:
   *   get:
   *     tags: [Import]
   *     summary: Tải template Excel cho phòng khám
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: File template
   *         content:
   *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
   *             schema:
   *               type: string
   *               format: binary
   */
  async downloadPhongKhamTemplate(req, res) {
    try {
      const templateData = [
        {
          "ID": "PHONG001",
          "Mã": "P101",
          "Tên": "Phòng khám Nội khoa 101",
          "Địa chỉ": "Tầng 1 - Khu A",
          "Cấp quản lý": "Phòng",
          "Mã Khoa Khám": "KHOA001", 
          "Mã Loại Khám": "LK001",
          "Mã Cổng Khám Ban Đầu": "CK001"
        }
      ];

      const ws = xlsx.utils.json_to_sheet(templateData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "PhongKham");

      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=template-phong-kham.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Download PhongKham template error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải template PhongKham'
      });
    }
  }

  /**
   * @swagger
   * /api/import/loai-kham/template:
   *   get:
   *     tags: [Import]
   *     summary: Tải template Excel cho loại khám
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: File template
   *         content:
   *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
   *             schema:
   *               type: string
   *               format: binary
   */
  async downloadLoaiKhamTemplate(req, res) {
    try {
      const templateData = [
        {
          "ID": "LK001",
          "Mã": "KBCB",
          "Tên": "Khám bệnh chữa bệnh"
        }
      ];

      const ws = xlsx.utils.json_to_sheet(templateData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "LoaiKham");

      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=template-loai-kham.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Download LoaiKham template error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải template LoaiKham'
      });
    }
  }

  /**
   * @swagger
   * /api/import/cong-kham/template:
   *   get:
   *     tags: [Import]
   *     summary: Tải template Excel cho cổng khám
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: File template
   *         content:
   *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
   *             schema:
   *               type: string
   *               format: binary
   */
  async downloadCongKhamTemplate(req, res) {
    try {
      const templateData = [
        {
          "Id": "CK001",
          "Mã BV": "C01",
          "Mã BHYT": "BH01", 
          "Tên BV": "Cổng khám số 1",
          "Tên BHYT": "Cổng BHYT 1"
        }
      ];

      const ws = xlsx.utils.json_to_sheet(templateData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "CongKham");

      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=template-cong-kham.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Download CongKham template error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải template CongKham'
      });
    }
  }
}

export default new ImportController();
