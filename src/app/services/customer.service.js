import customerRepository from '../repositories/customer.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class CustomerService {
	async register(data) {
		// Kiểm tra trùng lặp
		if (await customerRepository.findByPhone(data.phone_number)) {
			throw new Error('Số điện thoại đã tồn tại');
		}
		if (data.email && await customerRepository.findByEmail(data.email)) {
			throw new Error('Email đã tồn tại');
		}
		if (await customerRepository.findByCitizenId(data.citizen_id)) {
			throw new Error('CMND/CCCD đã tồn tại');
		}
		// Tạo customer
		const customer = await customerRepository.create({ ...data, role: 'user' });
		return customer.toPublicJSON();
	}

	async login(identifier, password) {
		let customer;
		if (identifier.includes('@')) {
			customer = await customerRepository.findByEmail(identifier);
		} else {
			customer = await customerRepository.findByPhone(identifier);
		}
		if (!customer) {
			throw new Error('Thông tin đăng nhập không đúng');
		}
		
		const isValidPassword = await bcrypt.compare(password, customer.password);
		if (!isValidPassword) {
			throw new Error('Thông tin đăng nhập không đúng');
		}
		// Tạo JWT
		const token = jwt.sign(
			{ userId: customer._id, email: customer.email, role: customer.role },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
		);
		return {
            token,
			customer: customer.toAuthJSON(),
		};
	}
}

export default new CustomerService();
