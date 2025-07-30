import Service from '../../models/service.model.js';

class ServiceController {
  async createService(req, res) {
    try {
      const service = new Service(req.body);
      await service.save();
      res.status(201).json(service);
    } catch (error) {
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

  async getServiceById(req, res) {
    try {
      const service = await Service.findById(req.params.id);
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
      const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.status(200).json(service);
    } catch (error) {
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