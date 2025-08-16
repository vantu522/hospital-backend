import applicationRepository from '../repositories/application.repository.js';
import fileService from './file.service.js';

class ApplicationService {
  /**
   * Validate application data
   */
  validateCreateData(data) {
    const errors = [];
    
    if (!data.name || !data.name.trim()) {
      errors.push('Tên ứng viên là bắt buộc');
    }

    if (!data.email || !data.email.trim()) {
      errors.push('Email là bắt buộc');
    }

    if (!data.phone || !data.phone.trim()) {
      errors.push('Số điện thoại là bắt buộc');
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
   * Validate status
   */
  validateStatus(status) {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Trạng thái phải là: pending, approved, hoặc rejected');
    }
  }

  /**
   * Prepare application data for creation
   */
  prepareCreateData(body, file) {
    return {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone.trim(),
      coverLetter: body.coverLetter || '',
      cvFileUrl: fileService.saveFile(file),
      status: 'pending'
    };
  }

  /**
   * Create new application
   */
  async createApplication(body, file) {
    try {
      this.validateCreateData(body);
      
      const applicationData = this.prepareCreateData(body, file);
      const application = await applicationRepository.create(applicationData);
      
      return {
        message: 'Đơn ứng tuyển đã được gửi thành công',
        application
      };
    } catch (error) {
      // Delete uploaded file if application creation fails
      if (file) {
        await fileService.deleteFile(file.filename);
      }
      throw error;
    }
  }

  /**
   * Get all applications with pagination and filters
   */
  async getAllApplications(query) {
    const { status, page, limit, sortBy, sortOrder } = query;
    
    // Build filter
    const filter = {};
    if (status) {
      this.validateStatus(status);
      filter.status = status;
    }

    // Pagination options
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    };

    return await applicationRepository.findWithPagination(filter, options);
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id) {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển');
    }
    return application;
  }

  /**
   * Get applications by status
   */
  async getApplicationsByStatus(status) {
    this.validateStatus(status);
    return await applicationRepository.findByStatus(status);
  }

  /**
   * Get application statistics
   */
  async getApplicationStats() {
    const stats = await applicationRepository.getApplicationStats();
    const result = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(id, status) {
    this.validateStatus(status);
    
    const application = await applicationRepository.updateById(id, { status });
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển');
    }

    return {
      message: 'Cập nhật trạng thái đơn ứng tuyển thành công',
      application
    };
  }

  /**
   * Prepare update data
   */
  prepareUpdateData(body, file, currentApplication) {
    const updateData = {};

    // Update basic fields
    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    }

    if (body.email !== undefined) {
      updateData.email = body.email.toLowerCase().trim();
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone.trim();
    }

    if (body.coverLetter !== undefined) {
      updateData.coverLetter = body.coverLetter;
    }

    if (body.status !== undefined) {
      this.validateStatus(body.status);
      updateData.status = body.status;
    }

    // Handle file update
    if (file) {
      updateData.cvFileUrl = fileService.saveFile(file);
    }

    return updateData;
  }

  /**
   * Update application
   */
  async updateApplication(id, body, file) {
    try {
      const currentApplication = await this.getApplicationById(id);
      
      const updateData = this.prepareUpdateData(body, file, currentApplication);
      
      // Replace old file if new one is uploaded
      if (file && currentApplication.cvFileUrl) {
        await fileService.deleteFile(currentApplication.cvFileUrl);
      }

      const application = await applicationRepository.updateById(id, updateData);
      
      return {
        message: 'Cập nhật đơn ứng tuyển thành công',
        application
      };
    } catch (error) {
      // Delete uploaded file if update fails
      if (file) {
        await fileService.deleteFile(file.filename);
      }
      throw error;
    }
  }

  /**
   * Delete application
   */
  async deleteApplication(id) {
    const application = await this.getApplicationById(id);

    // Delete associated CV file
    if (application.cvFileUrl) {
      await fileService.deleteFile(application.cvFileUrl);
    }

    await applicationRepository.deleteById(id);
    
    return { message: 'Đã xóa đơn ứng tuyển thành công' };
  }

  /**
   * Download CV file
   */
  async downloadCV(id) {
    const application = await this.getApplicationById(id);

    if (!application.cvFileUrl) {
      throw new Error('Không tìm thấy file CV');
    }

    const downloadInfo = fileService.getDownloadInfo(
      application.cvFileUrl,
      application.name,
      application._id
    );

    if (!downloadInfo.exists) {
      throw new Error('File CV không tồn tại trên server');
    }

    return {
      filePath: downloadInfo.filePath,
      fileName: downloadInfo.downloadName,
      stream: fileService.createReadStream(downloadInfo.filePath)
    };
  }
}

export default new ApplicationService();
