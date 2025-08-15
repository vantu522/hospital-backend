import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileService {
  constructor() {
    this.uploadsDir = path.resolve(__dirname, '../../../uploads/pdfs');
  }

  /**
   * Save uploaded file info
   */
  saveFile(file) {
    if (!file) return null;
    return file.filename;
  }

  /**
   * Get file path
   */
  getFilePath(filename) {
    if (!filename) return null;
    return path.join(this.uploadsDir, filename);
  }

  /**
   * Check if file exists
   */
  fileExists(filename) {
    if (!filename) return false;
    const filePath = this.getFilePath(filename);
    return fs.existsSync(filePath);
  }

  /**
   * Delete file
   */
  async deleteFile(filename) {
    if (!filename) return;
    
    try {
      const filePath = this.getFilePath(filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error to prevent blocking other operations
    }
  }

  /**
   * Replace old file with new one
   */
  async replaceFile(oldFilename, newFile) {
    // Delete old file
    await this.deleteFile(oldFilename);
    
    // Save new file
    return this.saveFile(newFile);
  }

  /**
   * Get file download info
   */
  getDownloadInfo(filename, applicantName, applicationId) {
    const filePath = this.getFilePath(filename);
    const safeName = applicantName.replace(/[^a-zA-Z0-9]/g, '_');
    const downloadName = `CV_${safeName}_${applicationId}.pdf`;
    
    return {
      filePath,
      downloadName,
      exists: fs.existsSync(filePath)
    };
  }

  /**
   * Create file stream for download
   */
  createReadStream(filePath) {
    return fs.createReadStream(filePath);
  }
}

export default new FileService();
