import Service from "../../models/service.model.js";
import { generateSlug } from "../../utils/slug.js";
import { cloudinary, getPublicId } from "../../config/cloudinary.js";
class ServiceController {
  async createService(req, res) {
    try {
      const avatarFile = req.files?.avatar?.[0];
      const imageFiles = req.files?.images || [];

      const serviceData = {
        ...req.body,
        slug: generateSlug(req.body.name), // Tạo slug từ tên dịch vụ
        avatar: avatarFile?.path || "", // Link từ Cloudinary
        images: imageFiles.map((file) => file.path), // Mảng link từ Cloudinary

        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const service = new Service(serviceData);
      await service.save();

      res.status(201).json(service);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }

  async getAllServices(req, res) {
    try {
      const services = await Service.find().populate("specialties", "name slug");
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getServiceBySlug(req, res) {
    try {
      const service = await Service.findOne({ slug: req.params.slug });
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(200).json(service);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

async updateService(req, res) {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const avatarFile = req.files?.avatar?.[0];
    const imageFiles = req.files?.images || [];

    const updatedData = {
      ...req.body,
      slug: generateSlug(req.body.name),
      updatedAt: new Date(),
    };

    // Xử lý avatar
    if (avatarFile) {
      if (service.avatar) {
        const publicId = getPublicId(service.avatar);
        await cloudinary.uploader.destroy(publicId); // chỉ 1 file, OK
      }
      updatedData.avatar = avatarFile.path;
    }

    // Xử lý nhiều ảnh nhanh hơn
    if (imageFiles.length > 0) {
      if (Array.isArray(service.images) && service.images.length > 0) {
        await Promise.all(
          service.images.map((img) => {
            const publicId = getPublicId(img);
            return cloudinary.uploader.destroy(publicId);
          })
        );
      }

      updatedData.images = imageFiles.map((file) => file.path);
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.status(200).json(updatedService);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
}


  async deleteService(req, res) {
    try {
      const service = await Service.findByIdAndDelete(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
        // Xóa avatar nếu có
    if (service.avatar) {
      const publicId = getPublicId(service.avatar);
      await cloudinary.uploader.destroy(publicId);
    }

      if (Array.isArray(service.images)) {
        for (const img of service.images) {
          const publicId = getPublicId(img);
          await cloudinary.uploader.destroy(publicId);
        }
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new ServiceController();
