import mongoose from "mongoose";

const informationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: false },
  phone_number: { type: String, required: false },
  email: { type: String, required: false },
  hotline: { type: String, required: false },
  emergency_phone: { type: String, required: false },
  work_hours: [{ type: String, required: false }],
  license: [{ type: String, required: false }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
const Information = mongoose.model("Information", informationSchema);

export default Information;
