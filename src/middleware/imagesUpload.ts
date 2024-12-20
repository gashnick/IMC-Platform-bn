import cloudinary from "cloudinary";
import multer from "multer";

// CONFIGURE IMAGE MIDDLEWARE
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${file.originalname}`);
  },
});

export const upload = multer({ storage: storage });

// CONFIGURE CLOUDINARY MIDDLEWARE
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
