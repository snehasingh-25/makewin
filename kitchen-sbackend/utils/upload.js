import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
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

const IMAGE_EXTS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".bmp", ".svg",
  ".tif", ".tiff", ".heic", ".heif", ".ico", ".jfif", ".pjpeg", ".pjp",
]);
const VIDEO_EXTS = new Set([
  ".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv", ".mpeg", ".mpg", ".ogv", ".3gp",
]);
const DOWNLOAD_EXTS = new Set([
  ".pdf", ".doc", ".docx", ".zip", ".rar", ".7z",
  ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv",
  ...IMAGE_EXTS,
  ...VIDEO_EXTS,
]);

function getExt(filename = "") {
  return extname(filename).toLowerCase();
}

function isImageFile(file) {
  const mime = (file.mimetype || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  // Browsers often send HEIC/unknown types as octet-stream or empty
  if (!mime || mime === "application/octet-stream") {
    return IMAGE_EXTS.has(getExt(file.originalname));
  }
  return IMAGE_EXTS.has(getExt(file.originalname));
}

function isVideoFile(file) {
  const mime = (file.mimetype || "").toLowerCase();
  if (mime.startsWith("video/")) return true;
  if (!mime || mime === "application/octet-stream") {
    return VIDEO_EXTS.has(getExt(file.originalname));
  }
  return VIDEO_EXTS.has(getExt(file.originalname));
}

function isDownloadFile(file) {
  const mime = (file.mimetype || "").toLowerCase();
  const ext = getExt(file.originalname);

  // Trust known extensions first — browsers often send blank/octet-stream for PDF/ZIP/DOC
  if (DOWNLOAD_EXTS.has(ext)) return true;

  if (isImageFile(file) || isVideoFile(file)) return true;

  const allowedMimes = new Set([
    "application/pdf",
    "application/x-pdf",
    "application/acrobat",
    "applications/vnd.pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/vnd.rar",
    "application/x-7z-compressed",
    "application/octet-stream",
    "binary/octet-stream",
    "application/force-download",
    "application/x-download",
  ]);

  return allowedMimes.has(mime);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = getExt(file.originalname) || "";
    let prefix = "file";
    if (isVideoFile(file)) prefix = "video";
    else if (isImageFile(file)) prefix = "image";
    cb(null, `${prefix}-${uniqueSuffix}${ext || ".bin"}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB — match product/dealer needs
  },
  fileFilter: (req, file, cb) => {
    if (isImageFile(file)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (any common image format)"), false);
    }
  },
});

export default upload;

// Video upload (larger size)
export const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (isVideoFile(file)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"), false);
    }
  },
});

// Combined upload for video and image (for reels: video + thumbnail)
export const uploadReelFiles = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (for videos)
  },
  fileFilter: (req, file, cb) => {
    if (isVideoFile(file) || isImageFile(file)) {
      cb(null, true);
    } else {
      cb(new Error("Only video and image files are allowed"), false);
    }
  },
});

// Product media: images (field "images") + videos (field "videos")
export const uploadProductMedia = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
  },
  fileFilter: (req, file, cb) => {
    if (isVideoFile(file) || isImageFile(file)) {
      cb(null, true);
    } else {
      cb(new Error("Only video and image files are allowed (any common format)"), false);
    }
  },
}).fields([
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
]);

// Helper function to upload to Cloudinary
export const uploadToCloudinary = async (filePath, originalName = "") => {
  if (!cloudinaryConfig) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "ecommerce",
      resource_type: "auto",
      quality: "auto",
    });
    // Delete local file after upload
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error?.message || error, originalName);
    return null;
  }
};

// Helper function to get image URL
export const getImageUrl = async (file) => {
  if (cloudinaryConfig) {
    const cloudinaryUrl = await uploadToCloudinary(file.path, file.originalname);
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
      console.error("Cloudinary video upload error:", error?.message || error);
      // fall through to local
    }
  }
  return `/uploads/${file.filename}`;
};

// Combined upload for Download assets (PDF, DOC, ZIP, MP4) + optional Cover Image
const downloadMulter = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
  },
  fileFilter: (req, file, cb) => {
    if (isDownloadFile(file)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type "${file.mimetype || "unknown"}" (${file.originalname}) is not allowed. Upload PDF, DOC, DOCX, ZIP, video, or any image format.`
        )
      );
    }
  },
}).fields([
  { name: "file", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

/** Multer wrapper — always returns JSON errors (avoids opaque "Failed to save" toasts). */
export const uploadDownloadFiles = (req, res, next) => {
  downloadMulter(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File too large (max 100MB)",
        message: "File too large (max 100MB)",
      });
    }

    const message = err.message || "Invalid file upload";
    return res.status(400).json({ error: message, message });
  });
};

// Helper function to upload any asset (PDF, ZIP, DOC, MP4) to Cloudinary or return local path
export const getDownloadFileUrl = async (file) => {
  if (cloudinaryConfig) {
    const attempts = [];
    if (isImageFile(file)) attempts.push("image");
    else if (isVideoFile(file)) attempts.push("video");
    else attempts.push("raw", "auto");

    let lastError = null;
    for (const resourceType of attempts) {
      try {
        const uploadOptions = {
          folder: "ecommerce",
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
          filename_override: file.originalname || undefined,
        };
        if (resourceType === "image") {
          uploadOptions.quality = "auto";
        }

        const result = await cloudinary.uploader.upload(file.path, uploadOptions);
        try {
          fs.unlinkSync(file.path);
        } catch {
          /* already removed */
        }
        return result.secure_url;
      } catch (error) {
        lastError = error;
        console.error(
          `Cloudinary download upload (${resourceType}) failed:`,
          error?.message || error
        );
      }
    }
    console.error("Cloudinary download file upload error:", lastError?.message || lastError);
    // Fall through to local
  }
  return `/uploads/${file.filename}`;
};

/** Parse a Cloudinary delivery URL into resource_type + public_id. */
export function parseCloudinaryUrl(fileUrl) {
  try {
    const u = new URL(fileUrl);
    if (!u.hostname.includes("res.cloudinary.com")) return null;

    const parts = u.pathname.split("/").filter(Boolean);
    // /{cloud}/{resourceType}/{type}/[transforms/]/v123/{publicId}
    if (parts.length < 4) return null;

    const resourceType = parts[1]; // image | video | raw
    const deliveryType = parts[2]; // upload
    if (!["image", "video", "raw"].includes(resourceType) || deliveryType !== "upload") {
      return null;
    }

    const afterType = parts.slice(3);
    const versionIdx = afterType.findIndex((p) => /^v\d+$/.test(p));
    const publicId = (versionIdx >= 0 ? afterType.slice(versionIdx + 1) : afterType).join("/");
    if (!publicId) return null;

    return { resourceType, deliveryType, publicId };
  } catch {
    return null;
  }
}

/**
 * Resolve a fetchable URL for a stored download asset.
 * Public Cloudinary raw/PDF delivery is often blocked (401) — use signed private download.
 */
export function resolveDownloadFetchUrl(fileUrl, { attachment = true } = {}) {
  if (!fileUrl) return null;

  if (fileUrl.startsWith("/uploads/")) {
    return { kind: "local", path: fileUrl };
  }

  const parsed = parseCloudinaryUrl(fileUrl);
  if (parsed && cloudinaryConfig) {
    // Raw public_id usually includes the extension (e.g. folder/file.pdf)
    let publicId = parsed.publicId;
    let format = "";

    if (parsed.resourceType !== "raw") {
      const slash = publicId.lastIndexOf("/");
      const name = slash >= 0 ? publicId.slice(slash + 1) : publicId;
      const dot = name.lastIndexOf(".");
      if (dot > 0) {
        format = name.slice(dot + 1);
        publicId = publicId.slice(0, publicId.length - format.length - 1);
      }
    }

    try {
      const signed = cloudinary.utils.private_download_url(publicId, format || undefined, {
        resource_type: parsed.resourceType,
        type: parsed.deliveryType || "upload",
        attachment: !!attachment,
        expires_at: Math.floor(Date.now() / 1000) + 15 * 60,
      });
      return { kind: "remote", url: signed };
    } catch (err) {
      console.error("Cloudinary signed download URL failed:", err?.message || err);
    }
  }

  // Public image URLs: force attachment when possible
  if (fileUrl.includes("res.cloudinary.com") && fileUrl.includes("/upload/") && !fileUrl.includes("fl_attachment")) {
    return { kind: "remote", url: fileUrl.replace("/upload/", "/upload/fl_attachment/") };
  }

  return { kind: "remote", url: fileUrl };
}
