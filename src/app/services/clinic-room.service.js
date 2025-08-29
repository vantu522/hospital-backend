import ClinicRoom from '../../models/clinic-room.model.js';

const ClinicRoomService = {
  async create(data) {
    return await ClinicRoom.create(data);
  },
  async getAll() {
    return await ClinicRoom.find();
  },
  async getById(id) {
    return await ClinicRoom.findById(id);
  },
  async update(id, data) {
    return await ClinicRoom.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return await ClinicRoom.findByIdAndDelete(id);
  }
};

export default ClinicRoomService;
