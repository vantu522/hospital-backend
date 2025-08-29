import ClinicRoom from '../../models/clinic-room.model.js';

const create = async (data) => ClinicRoom.create(data);
const findAll = async () => ClinicRoom.find();
const findById = async (id) => ClinicRoom.findById(id);
const update = async (id, data) => ClinicRoom.findByIdAndUpdate(id, data, { new: true });
const remove = async (id) => ClinicRoom.findByIdAndDelete(id);

export default {
  create,
  findAll,
  findById,
  update,
  remove
};
