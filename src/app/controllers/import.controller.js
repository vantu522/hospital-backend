import xlsx from 'xlsx';
import fs from 'fs';
import KhoaKham from '../../models/khoa-kham.model.js';
import PhongKham from '../../models/phong-kham.model.js';
import LoaiKham from '../../models/loai-kham.model.js';
import CongKham from '../../models/cong-kham.model.js';
class ImportController {
  // Import KhoaKham từ Excel
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

  // Import PhongKham từ Excel
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

        if (!id || !ma || !ten) {
          throw new Error(`Dòng ${index + 2}: Thiếu thông tin ID, Mã hoặc Tên`);
        }

        return {
          _id: id.toString().trim(),
          ma: ma.toString().trim().toUpperCase(),
          ten: ten.toString().trim(),
          dia_chi: diaChi ? diaChi.toString().trim() : '',
          cap_quan_li: capQuanLi ? capQuanLi.toString().trim() : 'Phòng',
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

  // Import LoaiKham từ Excel (chỉ lấy 3 cột đầu: ID, Mã, Tên)
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

  // Download template cho KhoaKham
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

  // Download template cho PhongKham
  async downloadPhongKhamTemplate(req, res) {
    try {
      const templateData = [
        {
          "ID": "PHONG001",
          "Mã": "P101",
          "Tên": "Phòng khám Nội khoa 101",
          "Địa chỉ": "Tầng 1 - Khu A",
          "Cấp quản lý": "Phòng"
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
}

export default new ImportController();
