const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let storage;
let isCloudinaryConfigured = false;

// Check if Cloudinary credentials are provided
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'food-genai',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
    });

    isCloudinaryConfigured = true;
    console.log('Cloudinary storage engine initialized.');
  } catch (error) {
    console.warn('Cloudinary config error, falling back to local storage:', error.message);
  }
}

// Fallback: Local storage configuration
if (!isCloudinaryConfigured) {
  const uploadDir = path.join(__dirname, '../uploads');
  
  // Ensure the directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
  });
  console.log('Fallback local disk storage engine initialized.');
}

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, PNG and WEBP image files are allowed.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = {
  upload,
  isCloudinaryConfigured,
};
