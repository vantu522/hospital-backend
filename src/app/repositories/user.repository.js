import BaseRepository from './base.repository.js';
import User from '../../models/user.model.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase() });
  }

  async findAdmins() {
    return await this.find({ role: 'admin' });
  }

  async findDoctors() {
    return await this.find({ role: 'doctor' });
  }

  async findUsers() {
    return await this.find({ role: 'user' });
  }

  async getUserStats() {
    return await this.model.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
  }
}

export default new UserRepository();
