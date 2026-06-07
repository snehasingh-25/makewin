import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contact.js";
import reelRoutes from "./routes/reels.js";
import bannerRoutes from "./routes/banners.js";
import dealerRoutes from "./routes/dealers.js";
import recommendationRoutes from "./routes/recommendations.js";
import generateDescriptionRoutes from "./routes/generate-description.js";
import chatRoutes from "./routes/chat.js";
import instagramRoutes from "./routes/instagram.js";
import cache from "./utils/cache.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://MakeWin.net",
      "https://www.MakeWin.net",
      "https://midnightblue-fish-476058.hostingersite.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// Enable HTTP keep-alive for connection pooling
app.set("keepAliveTimeout", 65000); // 65 seconds
app.set("headersTimeout", 66000); // 66 seconds (must be > keepAliveTimeout)

// CORS configuration

// Allow larger JSON payloads (e.g. product form data); multipart file size is limited by Multer and by proxy
app.use(express.json({ limit: "100mb" }));

// Handle Multer "file too large" so we return JSON with CORS headers instead of generic 413
app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "http://localhost:5173",
      "https://MakeWin.net",
      "https://www.MakeWin.net",
      "https://midnightblue-fish-476058.hostingersite.com"
    ];
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    return res.status(413).json({
      error: "File too large",
      message: "Image or video exceeds the maximum allowed size (100MB per file). Use smaller files or compress images."
    });
  }
  next(err);
});

// Request logging middleware removed (no console.log noise)

// Serve uploaded files
app.use(
  "/uploads",
  express.static(join(__dirname, "uploads"), {
    etag: true,
    lastModified: true,
    maxAge: "30d",
    immutable: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Backend is alive 🌱");
});

// Simple test endpoint (no database required)
app.get("/test", (req, res) => {
  const serverInfo = req.socket?.server?.address();
  res.json({ 
    message: "Server is responding",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || 3000,
      host: process.env.HOST || "0.0.0.0",
      hasDatabaseUrl: !!process.env.DATABASE_URL
    },
    server: {
      actualPort: serverInfo?.port,
      actualAddress: serverInfo?.address,
      family: serverInfo?.family
    }
  });
});

// Cache stats endpoint (for monitoring)
app.get("/cache/stats", (req, res) => {
  res.json(cache.getStats());
});

// Health check endpoint with database connection test
app.get("/health", async (req, res) => {
  try {
    const prisma = (await import("./prisma.js")).default;
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "healthy", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({ 
      status: "unhealthy", 
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/contact", contactRoutes);
app.use("/reels", reelRoutes);
app.use("/banners", bannerRoutes);
app.use("/dealers", dealerRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/generate-description", generateDescriptionRoutes);
app.use("/chat", chatRoutes);
app.use("/instagram", instagramRoutes);

// Global error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Ensure CORS headers are set even on errors
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:5173",
    "https://MakeWin.net",
    "https://www.MakeWin.net",
    "https://midnightblue-fish-476058.hostingersite.com"
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0"; // Listen on all interfaces for production

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit the process, just log it
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Don't exit immediately, let the server try to handle it
});

// Create HTTP server with keep-alive enabled
let server;
try {
  server = app.listen(PORT, HOST, () => {
    const actualPort = server.address().port;
    const actualAddress = server.address().address;
    void actualPort;
    void actualAddress;
  });

  server.on("error", (error) => {
    console.error("=== Server Error ===");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    if (error.code === "EADDRINUSE") {
      console.error(`✗ Port ${PORT} is already in use`);
      console.error("Please stop the process using this port or change the PORT environment variable");
    } else {
      console.error("Full error:", error);
    }
    process.exit(1);
  });
} catch (error) {
  console.error("=== Failed to Start Server ===");
  console.error("Error:", error);
  console.error("Stack:", error.stack);
  process.exit(1);
}

// Enable keep-alive on the server
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

// Graceful shutdown
process.on("SIGTERM", async () => {
  server.close(() => {
  });
});

process.on("SIGINT", async () => {
  server.close(() => {
  });
});
