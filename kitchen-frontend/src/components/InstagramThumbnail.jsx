import { useState } from "react";
import { useInstagramThumbnail } from "../hooks/useInstagramThumbnail";

/**
 * Instagram thumbnail component with play icon overlay
 * Displays thumbnail for Instagram posts/reels in the media preview strip
 */
export default function InstagramThumbnail({ url, onClick, className = "" }) {
  const { thumbnail, loading, error } = useInstagramThumbnail(url);
  const [imageError, setImageError] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const showFallback = loading || error || !thumbnail || imageError;

  return (
    <div
      className={`relative w-full h-full cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {showFallback ? (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-olive to-orange-500 flex items-center justify-center">
          {loading ? (
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          )}
        </div>
      ) : (
        <>
          <img
            src={thumbnail}
            alt="Instagram post"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors pointer-events-none">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cream/90 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

