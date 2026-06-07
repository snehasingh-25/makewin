import express from "express";

const router = express.Router();

/**
 * Proxy endpoint to fetch Instagram thumbnail via oEmbed API
 * This avoids CORS issues when fetching from the frontend
 */
router.get("/thumbnail", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Validate Instagram URL
    const instagramPattern = /^https:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+\/?(\?.*)?$/;
    const trimmed = url.trim();
    
    if (!instagramPattern.test(trimmed)) {
      return res.status(400).json({ error: "Invalid Instagram URL" });
    }

    // Fetch from Instagram oEmbed API
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(trimmed)}&omitscript=true`;
    
    const response = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "Failed to fetch Instagram thumbnail",
        status: response.status 
      });
    }

    const data = await response.json();
    
    if (data.thumbnail_url) {
      return res.json({ thumbnail_url: data.thumbnail_url });
    } else {
      return res.status(404).json({ error: "Thumbnail not found" });
    }
  } catch (error) {
    console.error("Error fetching Instagram thumbnail:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

export default router;

