import Doctor from "../../models/doctor.model.js";
import { generateSlug } from '../../utils/slug.js';
export const createDoctor = async (req, res) => {
  try {
    const avatarFile = req.files?.avatar?.[0];
    const doctorData = {
      ...req.body,
      slug: generateSlug(req.body.full_name), // Tạo slug từ tên bác sĩ
      avatar: avatarFile?.path || '', // Link từ Cloudinary
    }
    const doctor = new Doctor(doctorData);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDoctorBySlug = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({slug: req.params.slug})
    if (!doctor) return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      slug: generateSlug(req.body.full_name), // Cập nhật slug từ tên bác sĩ
    };
    const updated = await Doctor.findByIdAndUpdate(req.params.id,updatedData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const deleted = await Doctor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    res.json({ message: 'Đã xoá bác sĩ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
