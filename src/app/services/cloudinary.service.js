import { cloudinary, getPublicId } from '../../config/cloudinary.js';

class CloudinaryService {
  /**
   * Upload single file
   */
  async uploadFile(file) {
    if (!file) return null;
    return file.path;
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files) {
    if (!files || !Array.isArray(files)) return [];
    return files.map(file => file.path);
  }

  /**
   * Delete single image from Cloudinary
   */
  async deleteImage(imageUrl) {
    if (!imageUrl) return;
    try {
      const publicId = getPublicId(imageUrl);
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Không throw error để không block việc xóa record
    }
  }

  /**
   * Delete multiple images from Cloudinary
   */
  async deleteImages(imageUrls) {
    if (!imageUrls || !Array.isArray(imageUrls)) return;
    
    const deletePromises = imageUrls.map(url => this.deleteImage(url));
    await Promise.allSettled(deletePromises); // Sử dụng allSettled để không fail nếu 1 ảnh lỗi
  }

  /**
   * Replace old images with new ones
   */
  async replaceImages(oldImages, newFiles) {
    // Xóa ảnh cũ trước
    await this.deleteImages(oldImages);
    
    // Upload ảnh mới
    return this.uploadFiles(newFiles);
  }
}

export default new CloudinaryService();
