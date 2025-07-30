import Introduce from '../../models/introduce.model.js';

const introduceController = {
  createIntroduce: async (req, res) => {
    try {
      const introduce = new Introduce(req.body);
      await introduce.save();
      res.status(201).json(introduce);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  getAllIntroduces: async (req, res) => {
    try {
      const introduces = await Introduce.find();
      res.json(introduces);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getIntroduceById: async (req, res) => {
    try {
      const introduce = await Introduce.findById(req.params.id);
      if (!introduce) return res.status(404).json({ message: 'Không tìm thấy bài giới thiệu' });
      res.json(introduce);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateIntroduce: async (req, res) => {
    try {
      req.body.updatedAt = new Date();
      const updated = await Introduce.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Không tìm thấy bài giới thiệu' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  deleteIntroduce: async (req, res) => {
    try {
      const deleted = await Introduce.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Không tìm thấy bài giới thiệu' });
      res.json({ message: 'Đã xoá bài giới thiệu' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

export default introduceController;