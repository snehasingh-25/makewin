import express from "express";
import { fileURLToPath } from "url";
import { dirname, join, basename } from "path";
import fs from "fs";
import { verifyToken } from "../utils/auth.js";
import {
  uploadDownloadFiles,
  getImageUrl,
  getDownloadFileUrl,
  resolveDownloadFetchUrl,
} from "../utils/upload.js";
import prisma from "../prisma.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = join(__dirname, "../uploads");

function safeDownloadFilename(download) {
  const rawTitle = (download?.title || "download").trim() || "download";
  const safeTitle = rawTitle.replace(/[^\w\s.-]+/g, "").replace(/\s+/g, "_");
  const fromUrl = (download?.fileUrl || "").split("?")[0].split("/").pop() || "";
  const urlExt = fromUrl.includes(".") ? fromUrl.split(".").pop() : "";
  const typeExt = (download?.fileType || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const ext = (urlExt || typeExt || "bin").replace(/^\./, "");
  if (safeTitle.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) return safeTitle;
  return `${safeTitle}.${ext}`;
}

// Helper to format bytes to human readable sizes
function formatBytes(bytes, decimals = 1) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Map database record to safe JSON object
function mapDownload(d) {
  return {
    id: d.id,
    title: d.title,
    category: d.category,
    subcategory: d.subcategory || "",
    fileType: d.fileType || "",
    fileSize: d.fileSize || "",
    fileUrl: d.fileUrl,
    coverUrl: d.coverUrl || null,
    pages: d.pages !== null ? d.pages : null,
    order: d.order,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// 1. GET / - List all downloads sorted by category and order (Public)
router.get("/", async (req, res) => {
  try {
    const list = await prisma.download.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });
    res.json(list.map(mapDownload));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /all - List all downloads sorted by category and order (Admin only)
router.get("/all", verifyToken, async (req, res) => {
  try {
    const list = await prisma.download.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });
    res.json(list.map(mapDownload));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /file/:id - Stream file with Content-Disposition: attachment (Public)
// Must stay above /:id so "file" is not treated as an id.
router.get("/file/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid download id" });
    }

    const download = await prisma.download.findUnique({ where: { id } });
    if (!download?.fileUrl) {
      return res.status(404).json({ error: "Download not found" });
    }

    const filename = safeDownloadFilename(download);
    const resolved = resolveDownloadFetchUrl(download.fileUrl, { attachment: true });

    if (!resolved) {
      return res.status(404).json({ error: "File URL missing" });
    }

    if (resolved.kind === "local") {
      const localName = basename(resolved.path);
      const localPath = join(uploadsDir, localName);
      if (!fs.existsSync(localPath)) {
        return res.status(404).json({ error: "Local file not found" });
      }
      return res.download(localPath, filename);
    }

    const upstream = await fetch(resolved.url);
    if (!upstream.ok) {
      console.error("Download proxy upstream failed:", upstream.status, download.fileUrl);
      return res.status(502).json({ error: `Could not fetch file (${upstream.status})` });
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.replace(/"/g, "")}"`
    );
    const len = upstream.headers.get("content-length");
    if (len) res.setHeader("Content-Length", len);

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Download file proxy error:", error);
    res.status(500).json({ error: error.message || "Download failed" });
  }
});

// 4. GET /:id - Get single download record (Admin only)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const download = await prisma.download.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!download) {
      return res.status(404).json({ message: "Download not found" });
    }
    res.json(mapDownload(download));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST / - Create a download (Admin only)
router.post("/", verifyToken, uploadDownloadFiles, async (req, res) => {
  try {
    const { title, category, subcategory, order, pages } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: "Title and Category are required" });
    }

    if (!req.files || !req.files.file || !req.files.file[0]) {
      return res.status(400).json({ error: "Download file is required" });
    }

    const uploadedFile = req.files.file[0];
    const fileUrl = await getDownloadFileUrl(uploadedFile);
    
    // Automatically infer fileType and fileSize
    const fileType = uploadedFile.originalname.split(".").pop().toUpperCase();
    const fileSize = formatBytes(uploadedFile.size);

    let coverUrl = null;
    if (req.files.coverImage && req.files.coverImage[0]) {
      coverUrl = await getImageUrl(req.files.coverImage[0]);
    }

    const download = await prisma.download.create({
      data: {
        title,
        category,
        subcategory: subcategory || null,
        fileType,
        fileSize,
        fileUrl,
        coverUrl,
        pages: pages ? Number(pages) : null,
        order: order ? Number(order) : 0,
      },
    });

    res.status(201).json(mapDownload(download));
  } catch (error) {
    console.error("Create download error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. PUT /:id - Update a download (Admin only)
router.put("/:id", verifyToken, uploadDownloadFiles, async (req, res) => {
  try {
    const { title, category, subcategory, order, pages, existingCover } = req.body;
    const downloadId = Number(req.params.id);

    const existingDownload = await prisma.download.findUnique({
      where: { id: downloadId },
    });

    if (!existingDownload) {
      return res.status(404).json({ message: "Download not found" });
    }

    let fileUrl = existingDownload.fileUrl;
    let fileType = existingDownload.fileType;
    let fileSize = existingDownload.fileSize;

    if (req.files && req.files.file && req.files.file[0]) {
      const uploadedFile = req.files.file[0];
      fileUrl = await getDownloadFileUrl(uploadedFile);
      fileType = uploadedFile.originalname.split(".").pop().toUpperCase();
      fileSize = formatBytes(uploadedFile.size);
    }

    // Cover image logic: if new file uploaded, use it. If not, check if existingCover was deleted (empty string / undefined)
    let coverUrl = existingCover === undefined ? existingDownload.coverUrl : (existingCover || null);
    
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      coverUrl = await getImageUrl(req.files.coverImage[0]);
    }

    const updated = await prisma.download.update({
      where: { id: downloadId },
      data: {
        title: title || existingDownload.title,
        category: category || existingDownload.category,
        subcategory: subcategory !== undefined ? subcategory : existingDownload.subcategory,
        fileType,
        fileSize,
        fileUrl,
        coverUrl,
        pages: pages !== undefined ? (pages ? Number(pages) : null) : existingDownload.pages,
        order: order !== undefined ? Number(order) : existingDownload.order,
      },
    });

    res.json(mapDownload(updated));
  } catch (error) {
    console.error("Update download error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. DELETE /:id - Delete a download (Admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await prisma.download.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Download deleted successfully" });
  } catch (error) {
    console.error("Delete download error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
