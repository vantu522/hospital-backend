import { cloudinary, getPublicId } from '../../config/cloudinary.js';
import Specialty from '../../models/specialty.model.js';
import { generateSlug } from '../../utils/slug.js';

const specialtyController = {
  createSpecialty: async (req, res) => {
    try {
      const specialtyData = {
        ...req.body,
        slug: generateSlug(req.body.name),
        images: req.files?.images ? req.files.images.map(file => file.path) : [],
      }
      const specialty = new Specialty(specialtyData);
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

  getSpecialtyBySlug: async (req, res) => {
    try {

      const specialty = await Specialty.findOne({slug:req.params.slug});
      if (!specialty) return res.status(404).json({ message: 'Không tìm thấy chuyên khoa' });
      res.json(specialty);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateSpecialty: async (req, res) => {
    try {
      const updatedData = {
        ...req.body,
        slug: generateSlug(req.body.name)
      }
      const updated = await Specialty.findById(req.params.id, updatedData, { new: true });
      if (!updated) return res.status(404).json({ message: 'Không tìm thấy chuyên khoa' });

      const imageFiles = req.files.images || [];
        // Nếu có ảnh mới => cập nhật mảng ảnh
    if (imageFiles.length > 0) {
      updatedData.images = imageFiles.map((file) => file.path);
    }
    const updatedSpecialty = await Specialty.findByIdAndUpdate(req.params.id, updatedData, {new:true})

      res.status(200).json(updatedSpecialty);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  deleteSpecialty: async (req, res) => {
    try {
      const deleted = await Specialty.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Không tìm thấy chuyên khoa' });
      res.json({ message: 'Đã xoá chuyên khoa' });

      if(Array.isArray(deleted.images)){
        for (const img of deleted.images){
          const publicId = getPublicId(img);
          await cloudinary.uploader.destroy(publicId);
        }
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

export default specialtyController;