import Recruitment from '../../models/recruitment.model.js';
import { generateSlug } from '../../utils/slug.js';
const recruitmentController = {
  createRecruitment: async (req, res) => {
    try {
           const documentFiles = req.files?.document?.[0];



      const recruitmentData = {
        ...req.body,
        slug: generateSlug(req.body.title), // Tạo slug từ tên dịch vụ
        document: documentFiles?.path || "", // Link từ Cloudinary
         resource_type: documentFiles?.mimetype?.includes('image') ? 'image' : 'raw',
      }
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
      if (!recruitment) return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
      res.json(recruitment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateRecruitment: async (req, res) => {
    try {
      req.body.updatedAt = new Date();
      const updated = await Recruitment.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  deleteRecruitment: async (req, res) => {
    try {
      const deleted = await Recruitment.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
      res.json({ message: 'Đã xoá tin tuyển dụng' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

export default recruitmentController;