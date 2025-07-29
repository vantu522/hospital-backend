import * as contactService from '../services/contact.service.js';

export async function createContact(req, res) {
    const contact = await contactService.create(req.body);
    res.status(201).json({ message: 'Tạo liên hệ thành công',data: contact, success: true });
}

export async function getAllContacts(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const contacts = await contactService.getAllContacts(page,limit);
    res.status(200).json(contacts);
}

export async function deleteContact(req, res) {
    const {id } = req.params;
    const contact = await contactService.deleteContact(id);
    res.status(200).json({ message: 'Xóa liên hệ thành công', data: contact, success: true });
}

export async function deleteAllContacts(req, res) {
    await contactService.deleteAllContacts();
    res.status(200).json({ message: 'Xóa tất cả liên hệ thành công', success: true });
}