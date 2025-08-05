import multer from "multer";
import path from "path";
import fs from "fs";

// Tạo thư mục nếu chưa có
const uploadDir = "uploads/pdfs";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Chỉ chấp nhận file PDF"));
};

export const uploadPDF = multer({ storage, fileFilter });
