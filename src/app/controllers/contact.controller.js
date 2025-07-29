import * as contactService from '../services/contact.service.js';

export async function createContact(req, res) {
    const contact = await contactService.create(req.body);
    res.status(201).json({ message: 'Tạo liên hệ thành công',data: contact, success: true });
}