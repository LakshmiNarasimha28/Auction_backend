import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { v2 as cloudinaryV2 } from "cloudinary";

// Use memory storage - files are stored in memory before upload to Cloudinary
const storage = multer.memoryStorage();

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
  
  if (file.fieldname === "images") {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image format. Only JPG, PNG, GIF, and WEBP allowed."), false);
    }
  } else if (file.fieldname === "video") {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video format. Only MP4, MOV, and AVI allowed."), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 11 // max 10 images + 1 video
  }
});

// Middleware to upload files to Cloudinary after they're buffered
export const uploadToCloudinary = (req, res, next) => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return next();
  }

  // Prepare upload promises
  const uploadPromises = [];

  // Handle images
  if (req.files.images) {
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    images.slice(0, 5).forEach((file) => {
      uploadPromises.push(
        new Promise((resolve, reject) => {
          cloudinaryV2.uploader.upload_stream(
            {
              folder: "auction_media",
              resource_type: "auto",
              public_id: `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve({ url: result.secure_url, type: "image" });
            }
          ).end(file.buffer);
        })
      );
    });
  }

  // Handle video
  if (req.files.video) {
    const video = Array.isArray(req.files.video) ? req.files.video[0] : req.files.video;
    uploadPromises.push(
      new Promise((resolve, reject) => {
        cloudinaryV2.uploader.upload_stream(
          {
            folder: "auction_media",
            resource_type: "video",
            public_id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({ url: result.secure_url, type: "video" });
          }
        ).end(video.buffer);
      })
    );
  }

  // Execute all uploads
  Promise.all(uploadPromises)
    .then((uploadedFiles) => {
      req.uploadedFiles = uploadedFiles;
      next();
    })
    .catch((error) => {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({
        success: false,
        message: "File upload failed",
        error: error.message
      });
    });
};

export default upload;