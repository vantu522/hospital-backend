import customerRepository from '../repositories/customer.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class CustomerService {
	async register(data) {
		console.log('[Service] Bắt đầu register customer:', data);
		// Kiểm tra trùng lặp
		const existed = await customerRepository.findByPhone(data.phone_number);
		console.log('[Service] Kết quả kiểm tra trùng lặp:', existed);
		if (existed) {
			console.error('[Service] Số điện thoại đã tồn tại');
			throw new Error('Số điện thoại đã tồn tại');
		}
		// Chỉ nhận phone_number và password
		const customer = await customerRepository.create({ phone_number: data.phone_number, password: data.password, role: 'user' });
		console.log('[Service] Customer đã tạo:', customer);
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
