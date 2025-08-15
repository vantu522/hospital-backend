import Customer from '../../models/customer.model.js';

class CustomerRepository {
	async findByPhone(phone_number) {
		return await Customer.findOne({ phone_number });
	}

	async findByEmail(email) {
		if (!email) return null;
		return await Customer.findOne({ email });
	}

	async findByCitizenId(citizen_id) {
		return await Customer.findOne({ citizen_id });
	}

	async create(data) {
		const customer = new Customer(data);
		return await customer.save();
	}
}

export default new CustomerRepository();
