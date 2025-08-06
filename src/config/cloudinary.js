// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {
  CLOUD_NAME,
  CLOUD_API_KEY,
  CLOUD_API_SECRET,
} from './constants.js';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
const documentExtensions = ['pdf', 'doc', 'docx'];

function getResourceType(extension) {
  const ext = extension.toLowerCase();
  if (imageExtensions.includes(ext)) return 'image';
  if (documentExtensions.includes(ext)) return 'raw';
  throw new Error('Unsupported file type'); // hoặc bạn có thể cho phép skip file
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const resourceType = getResourceType(ext);

    return {
      folder: 'hospital_uploads',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      resource_type: resourceType,
      allowed_formats: [...imageExtensions, ...documentExtensions],
      use_filename: true,
      filename_override: file.originalname,
      overwrite: true,
    };
  },
});



function getPublicId(url) {
  const parts = url.split('/');
  const fileWithExt = parts[parts.length - 1]; // eg. myfile.pdf
  const folder = parts[parts.length - 2]; // eg. hospital_uploads
  const publicId = `${folder}/${fileWithExt.split('.')[0]}`;
  return publicId;
}

export { cloudinary, storage, getPublicId };
