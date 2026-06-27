import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse Cloudinary URL if provided
let cloudinaryConfig = null;

if (process.env.CLOUDINARY_URL) {
  const url = process.env.CLOUDINARY_URL;
  const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (match) {
    cloudinaryConfig = {
      api_key: match[1],
      api_secret: match[2],
      cloud_name: match[3],
    };
  }
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
}

if (cloudinaryConfig) {
  cloudinary.config(cloudinaryConfig);
}

// Local storage configuration
const uploadsDir = join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    let prefix = "file";
    if (file.mimetype.startsWith("video/")) {
      prefix = "video";
    } else if (file.mimetype.startsWith("image/")) {
      prefix = "image";
    }
    cb(null, `${prefix}-${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

export default upload;

// Video upload (larger size)
export const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"), false);
    }
  },
});

// Combined upload for video and image (for reels: video + thumbnail)
export const uploadReelFiles = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (for videos)
  },
  fileFilter: (req, file, cb) => {
    // Accept both video and image files
    if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video and image files are allowed"), false);
    }
  },
});

// Product media: images (field "images") + videos (field "videos")
// Max 50MB per file. Your reverse proxy (e.g. nginx) must allow this: client_max_body_size 50m;
export const uploadProductMedia = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file (images and videos)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video and image files are allowed"), false);
    }
  },
}).fields([
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
]);

// Helper function to upload to Cloudinary
export const uploadToCloudinary = async (filePath) => {
  if (!cloudinaryConfig) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "ecommerce",
      resource_type: "image",
      format: "webp",
      quality: "auto",
    });
    // Delete local file after upload
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

// Helper function to get image URL
export const getImageUrl = async (file) => {
  if (cloudinaryConfig) {
    const cloudinaryUrl = await uploadToCloudinary(file.path);
    if (cloudinaryUrl) {
      return cloudinaryUrl;
    }
  }
  // Return local file path
  return `/uploads/${file.filename}`;
};

export const getVideoUrl = async (file) => {
  if (cloudinaryConfig) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "ecommerce",
        resource_type: "video",
      });
      fs.unlinkSync(file.path);
      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary video upload error:", error);
      // fall through to local
    }
  }
  return `/uploads/${file.filename}`;
};

// Combined upload for Download assets (PDF, DOC, ZIP, MP4) + optional Cover Image (JPG, PNG, WEBP)
export const uploadDownloadFiles = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
  },
  fileFilter: (req, file, cb) => {
    // We can allow all standard files for downloads
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/x-zip-compressed",
      "video/mp4",
      "image/jpeg",
      "image/png",
      "image/webp"
    ];
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed. Please upload PDF, DOC, DOCX, ZIP, MP4, or images.`), false);
    }
  },
}).fields([
  { name: "file", maxCount: 1 },
  { name: "coverImage", maxCount: 1 }
]);

// Helper function to upload any asset (PDF, ZIP, DOC, MP4) to Cloudinary or return local path
export const getDownloadFileUrl = async (file) => {
  if (cloudinaryConfig) {
    try {
      let resourceType = "raw"; // raw for PDF, ZIP, DOC
      if (file.mimetype.startsWith("image/")) {
        resourceType = "image";
      } else if (file.mimetype.startsWith("video/")) {
        resourceType = "video";
      }

      const uploadOptions = {
        folder: "ecommerce",
        resource_type: resourceType,
      };

      if (resourceType === "image") {
        uploadOptions.format = "webp";
        uploadOptions.quality = "auto";
      }

      const result = await cloudinary.uploader.upload(file.path, uploadOptions);
      fs.unlinkSync(file.path);
      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary download file upload error:", error);
      // Fall through to local
    }
  }
  return `/uploads/${file.filename}`;
};

