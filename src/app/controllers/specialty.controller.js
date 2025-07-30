import Specialty from '../../models/specialty.model.js';

const specialtyController = {
  createSpecialty: async (req, res) => {
    try {
      const specialty = new Specialty(req.body);
      await specialty.save();
      res.status(201).json(specialty);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  getAllSpecialties: async (req, res) => {
    try {
      const specialties = await Specialty.find();
      res.json(specialties);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getSpecialtyById: async (req, res) => {
    try {
      const specialty = await Specialty.findById(req.params.id);
      if (!specialty) return res.status(404).json({ message: 'Không tìm thấy chuyên khoa' });
      res.json(specialty);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateSpecialty: async (req, res) => {
    try {
      req.body.ngayCapNhat = new Date();
      const updated = await Specialty.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Không tìm thấy chuyên khoa' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  deleteSpecialty: async (req, res) => {
    try {
      const deleted = await Specialty.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Không tìm thấy chuyên khoa' });
      res.json({ message: 'Đã xoá chuyên khoa' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

export default specialtyController;