import Contact from '../../models/contact.js';

export const createContact = async (req, res) => {
  try {
    const contactData = req.body;
    const contact = new Contact(contactData);
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const updateContact = async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
    res.json(updated);
    }
    catch (err) {
    res.status(400).json({ error: err.message });
    }   
}

export const deleteContact = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy liên hệ' });
    res.json({ message: 'Đã xoá liên hệ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}