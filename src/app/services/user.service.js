import userRepository from '../repositories/user.repository.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middlewares/auth.js';
import UserValidator from '../middlewares/user.validator.js';

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
    // Validate data
    const dataValidation = UserValidator.validateCreate(body);
    if (!dataValidation.isValid) {
      throw new Error(dataValidation.errors.join(', '));
    }

    // Check email exists
    await this.checkEmailExists(body.email);

    const targetRole = body.role || 'admin';

    // Không cần mã hóa mật khẩu ở service, model sẽ tự động hash
    const userData = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      password: body.password,
      role: targetRole
    };

    return await userRepository.create(userData);
  }

  /**
   * Get all users
   */
  async getAllUsers() {
  
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
      throw new Error('Email không tồn tại');
    }

    // Log password nhập vào và password đã mã hóa trong DB
    console.log('Password nhập vào:', password);
    console.log('Password đã mã hóa trong DB:', user.password);

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Kết quả so sánh:', isValidPassword);
    if (!isValidPassword) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

  // Generate JWT token
  const token = generateToken({ userId: user._id, email: user.email, role: user.role });

    return {
      token,
      user: user.toAuthJSON()
    };
  }

  /**
   * Update user
   */
  async updateUser(id, body, updaterRole) {
    const user = await this.getUserById(id);
    
    // Validate data
    const dataValidation = UserValidator.validateUpdate(body);
    if (!dataValidation.isValid) {
      throw new Error(dataValidation.errors.join(', '));
    }
    
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
      // Check permissions for role update
      const permissionValidation = UserValidator.validateUpdatePermissions(updaterRole, user.role, body.role);
      if (!permissionValidation.isValid) {
        throw new Error(permissionValidation.errors.join(', '));
      }
      updateData.role = body.role;
    }

    return await userRepository.updateById(id, updateData);
  }

  /**
   * Delete user
   */
  async deleteUser(id, deleterRole) {
    const user = await this.getUserById(id);
    
    // Check permissions
    const permissionValidation = UserValidator.validateDeletePermissions(deleterRole, user.role);
    if (!permissionValidation.isValid) {
      throw new Error(permissionValidation.errors.join(', '));
    }
    
    await userRepository.deleteById(id);
    return { message: 'Đã xóa người dùng thành công' };
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const stats = await userRepository.getUserStats();
    const result = {
      superadmin: 0,
      admin: 0,
      receptionist: 0,
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
