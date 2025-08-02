import Information from "../../models/information.js";

export const createInformation = async (req, res) => {
  try {
    const informationData = req.body;
    const information = new Information(informationData);
    await information.save();
    res.status(201).json(information);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const getAllInformation = async (req, res) => {
  try {
    const information = await Information.find();
    res.json(information);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const updateInformation = async (req, res) => {
  try {
    const updated = await Information.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy thông tin' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const deleteInformation = async (req, res) => {
  try {
    const deleted = await Information.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy thông tin' });
    res.json({ message: 'Đã xoá thông tin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}