import { useState, useEffect } from "react";
import { API } from "../api";

/**
 * Extracts Instagram post ID from URL
 */
function getInstagramPostId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const reelMatch = trimmed.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
  const postMatch = trimmed.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
  return reelMatch?.[1] || postMatch?.[1] || null;
}

/**
 * Fetches Instagram thumbnail using backend proxy API
 */
async function fetchInstagramThumbnail(url) {
  try {
    // Use backend proxy to avoid CORS issues
    const response = await fetch(`${API}/instagram/thumbnail?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch thumbnail");
    }
    
    const data = await response.json();
    return data.thumbnail_url || null;
  } catch (error) {
    console.error("Error fetching Instagram thumbnail:", error);
    return null;
  }
}

/**
 * Hook to fetch and manage Instagram thumbnail
 * @param {string} url - Instagram post/reel URL
 * @returns {object} - { thumbnail, loading, error }
 */
export function useInstagramThumbnail(url) {
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const postId = getInstagramPostId(url);
    if (!postId) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);
    setThumbnail(null);

    fetchInstagramThumbnail(url)
      .then((thumb) => {
        if (thumb) {
          setThumbnail(thumb);
          setError(false);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error in useInstagramThumbnail:", err);
        setError(true);
        setLoading(false);
      });
  }, [url]);

  return { thumbnail, loading, error };
}

