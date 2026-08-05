const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const cloudinaryConfig = require('../config/cloudinary');
const { BadRequestError } = require('../utils/customErrors');
const logger = require('../config/logger');

// Configure Cloudinary SDK
if (cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret) {
  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret
  });
} else {
  logger.warn('Cloudinary credentials not set. Upload middleware will run in mock mode.');
}

// Multer memory storage configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file type: Only images are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Compression & Cloudinary stream upload middleware
const uploadAndCompressImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.uploadedImages = [];
      return next();
    }

    const uploadPromises = req.files.map(async (file) => {
      // 1. Image Compression using Sharp
      const compressedBuffer = await sharp(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Downscale if larger
        .jpeg({ quality: 80 }) // Compress to JPEG
        .toBuffer();

      // 2. Check if Cloudinary is configured, otherwise mock upload
      if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey || !cloudinaryConfig.apiSecret) {
        return `https://res.cloudinary.com/mock-cloud/image/upload/v123456/mock_${Date.now()}_${file.originalname}`;
      }

      // 3. Upload to Cloudinary via stream
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: cloudinaryConfig.folderName,
            resource_type: 'image'
          },
          (error, result) => {
            if (error) {
              logger.error(`Cloudinary upload failed: ${error.message}`);
              return reject(new BadRequestError('Failed to upload image to cloud storage'));
            }
            resolve(result.secure_url);
          }
        );
        uploadStream.end(compressedBuffer);
      });
    });

    req.uploadedImages = await Promise.all(uploadPromises);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  parser: upload.array('images', 5), // Max 5 images
  uploadAndCompressImages
};
