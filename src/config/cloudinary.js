import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { CLOUD_API_KEY,CLOUD_NAME,CLOUD_API_SECRET } from './constants.js';

cloudinary.config({
  cloud_name: CLOUD_NAME ,
  api_key: CLOUD_API_KEY ,
  api_secret: CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hospital_images', 
    allowed_formats: [  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'tiff', 'ico'],
  },
});

export { cloudinary, storage };
