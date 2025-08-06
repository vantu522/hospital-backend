import Recruitment from "../../models/recruitment.model.js";
import { generateSlug } from "../../utils/slug.js";
import fs from "fs";
import path from "path";
const recruitmentController = {
  createRecruitment: async (req, res) => {
    try {
      const documentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

      const recruitmentData = {
        ...req.body,
        slug: generateSlug(req.body.title), // Tạo slug từ tên dịch vụ
        document: documentPath,
      };
      const recruitment = new Recruitment(recruitmentData);
      await recruitment.save();
      res.status(201).json(recruitment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  getAllRecruitments: async (req, res) => {
    try {
      const recruitments = await Recruitment.find();
      res.json(recruitments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getRecruitmentById: async (req, res) => {
    try {
      const recruitment = await Recruitment.findById(req.params.id);
      if (!recruitment)
        return res
          .status(404)
          .json({ message: "Không tìm thấy tin tuyển dụng" });
      res.json(recruitment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getRecruitmentBySlug: async (req, res) => {
    try {
      const recruitment = await Recruitment.findOne({ slug: req.params.slug });
      if (!recruitment) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tin tuyển dụng" });
      }
      res.json(recruitment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateRecruitment: async (req, res) => {
    try {
      const recruitment = await Recruitment.findById(req.params.id);
      if (!recruitment)
        return res
          .status(404)
          .json({ message: "Không tìm thấy tin tuyển dụng" });

      // Nếu có file mới thì xoá file cũ
      if (req.file) {
        if (recruitment.document) {
          const oldPath = path.resolve(recruitment.document);

          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      }

      const documentPath = req.file
        ? req.file.path.replace(/\\/g, "/")
        : recruitment.document;

      const updatedData = {
        ...req.body,
        document: documentPath,
        updatedAt: new Date(),
      };

      const updated = await Recruitment.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  deleteRecruitment: async (req, res) => {
    try {
      const recruitment = await Recruitment.findById(req.params.id);
      if (!recruitment)
        return res
          .status(404)
          .json({ message: "Không tìm thấy tin tuyển dụng" });

      // Xoá file document nếu có
      if (recruitment.document) {
        const filePath = path.resolve(recruitment.document);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Xoá dữ liệu trong MongoDB
      await Recruitment.findByIdAndDelete(req.params.id);

      res.json({ message: "Đã xoá tin tuyển dụng và tài liệu đính kèm" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

export default recruitmentController;
