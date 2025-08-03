import Service from '../../models/service.model.js';
import { generateSlug } from '../../utils/slug.js';
class ServiceController {
  async createService(req, res) {
  try {
    const avatarFile = req.files?.avatar?.[0];
    const imageFiles = req.files?.images || [];

    const serviceData = {
      ...req.body,
      slug: generateSlug(req.body.name), // Tạo slug từ tên dịch vụ
      avatar: avatarFile?.path || '', // Link từ Cloudinary
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
      const services = await Service.find();
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getServiceBySlug(req, res) {
    try {
      const service = await Service.findOne({ slug: req.params.slug });
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.status(200).json(service);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateService(req, res) {
  try {
    const updatedData = {
      ...req.body,
      slug: generateSlug(req.body.name), // Cập nhật slug từ tên dịch vụ
    }
    const service = await Service.findById(req.params.id, updatedData, { new: true });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const avatarFile = req.files?.avatar?.[0];
    const imageFiles = req.files?.images || [];

    
    // Nếu có avatar mới => cập nhật
    if (avatarFile) {
      updatedData.avatar = avatarFile.path;
    }

    // Nếu có ảnh mới => cập nhật mảng ảnh
    if (imageFiles.length > 0) {
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
        return res.status(404).json({ message: 'Service not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new ServiceController();