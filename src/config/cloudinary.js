import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { CLOUD_API_KEY, CLOUD_API_SECRET, CLOUD_NAME } from './constants.js';

cloudinary.config({
  cloud_name: "dvzobnndv",
  api_key: "446155766284426",
  api_secret: "6iQeEvRTBJJm2AtOZ3saB6yQg5s",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hospital_images', 
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

export { cloudinary, storage };
