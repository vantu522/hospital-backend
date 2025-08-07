import { cloudinary, getPublicId } from "../../config/cloudinary.js";
import Doctor from "../../models/doctor.model.js";
import Specialty from "../../models/specialty.model.js";
import { generateSlug } from "../../utils/slug.js";
export const createDoctor = async (req, res) => {
  try {
    const avatarFile = req.files?.avatar?.[0];
    const doctorData = {
      ...req.body,
      slug: generateSlug(req.body.full_name), // Tạo slug từ tên bác sĩ
      avatar: avatarFile?.path || "", // Link từ Cloudinary
    };
    const doctor = new Doctor(doctorData);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const filter = {};

    // Nếu có query specialty thì lọc theo chuyên khoa
    if (req.query.specialty) {
      filter.specialties = req.query.specialty;
    }

    const doctors = await Doctor.find(filter).populate("specialties", "name");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getDoctorBySlug = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ slug: req.params.slug }) .populate('specialties', 'name');;
    if (!doctor)
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    }

    const avatarFile = req.files?.avatar?.[0];

    const updatedData = {
      ...req.body,
      slug: generateSlug(req.body.full_name),
    };

    if (avatarFile) {
      if (doctor.avatar) {
        const publicId = getPublicId(doctor.avatar);
        await cloudinary.uploader.destroy(publicId);
      }
      updatedData.avatar = avatarFile.path;
    }

    const updated = await Doctor.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const deleted = await Doctor.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    if (deleted.avatar) {
      const publicId = getPublicId(deleted.avatar);
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ message: "Đã xoá bác sĩ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialtyId } = req.params;

    // Tìm bác sĩ theo ID của chuyên khoa
    const doctors = await Doctor.find({ 
      specialties: specialtyId 
    }).populate("specialties", "name slug");

    if (doctors.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy bác sĩ nào thuộc chuyên khoa này",
      });
    }

    res.json({
      count: doctors.length,
      doctors: doctors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getFiveRandomDoctors = async (req, res) => {
  try {
    // Lấy danh sách 5 ID bác sĩ ngẫu nhiên
    const randomDoctors = await Doctor.aggregate([
      { $sample: { size: 5 } },
      { $project: { _id: 1 } },
    ]);

    const ids = randomDoctors.map((doc) => doc._id);

    // Dùng find + populate để lấy đầy đủ thông tin
    const doctors = await Doctor.find({ _id: { $in: ids } }).populate("specialties", "name slug");

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


