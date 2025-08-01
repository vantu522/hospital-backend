import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: "dvzobnndv",
  api_key: "446155766284426",
  api_secret: "6iQeEvRTBJJm2AtOZ3saB6yQg5s",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hospital_images', 
    allowed_formats: [  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'tiff', 'ico'],
  },
});

export { cloudinary, storage };
