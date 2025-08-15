import userRepository from '../repositories/user.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class UserService {
  /**
   * Validate user data
   */
  validateCreateData(data) {
    const errors = [];
    
    if (!data.name || !data.name.trim()) {
      errors.push('Tên người dùng là bắt buộc');
    }

    if (!data.email || !data.email.trim()) {
      errors.push('Email là bắt buộc');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Email không hợp lệ');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Check if email already exists
   */
  async checkEmailExists(email) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email đã tồn tại');
    }
  }

  /**
   * Create new user
   */
  async createUser(body) {
    this.validateCreateData(body);
    await this.checkEmailExists(body.email);
    
    const userData = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      password: body.password,
      role: body.role || 'user'
    };

    return await userRepository.create(userData);
  }

  /**
   * Get all users
   */
  async getAllUsers(role = null) {
    if (role) {
      switch (role) {
        case 'admin':
          return await userRepository.findAdmins();
        case 'doctor':
          return await userRepository.findDoctors();
        case 'user':
          return await userRepository.findUsers();
        default:
          return await userRepository.find();
      }
    }
    return await userRepository.find();
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    return await userRepository.findByEmail(email);
  }

  /**
   * Login user
   */
  async loginUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: user.toAuthJSON()
    };
  }

  /**
   * Update user
   */
  async updateUser(id, body) {
    const user = await this.getUserById(id);
    
    const updateData = {};
    
    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    }

    if (body.email !== undefined) {
      const email = body.email.toLowerCase().trim();
      if (email !== user.email) {
        await this.checkEmailExists(email);
        updateData.email = email;
      }
    }

    if (body.password !== undefined) {
      if (body.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }
      updateData.password = body.password;
    }

    if (body.role !== undefined) {
      updateData.role = body.role;
    }

    return await userRepository.updateById(id, updateData);
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    await this.getUserById(id);
    await userRepository.deleteById(id);
    return { message: 'Đã xóa người dùng thành công' };
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const stats = await userRepository.getUserStats();
    const result = {
      admin: 0,
      doctor: 0,
      user: 0,
      total: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }
}

export default new UserService();
