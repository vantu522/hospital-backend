import mongoose from 'mongoose';

const clinicRoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  rooms: [{ type: String, required: true }] 
}, { timestamps: true });

export default mongoose.model('ClinicRoom', clinicRoomSchema);
