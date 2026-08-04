/**
 * Normalize video URLs for mobile playback.
 * Cloudinary: force H.264 MP4 so Android/iOS can play (HEVC uploads often fail on Chrome).
 */
export function toPlayableVideoUrl(url) {
  if (!url || typeof url !== "string") return url;

  try {
    const u = new URL(url);
    if (!u.hostname.includes("res.cloudinary.com")) return url;
    if (!u.pathname.includes("/video/upload/")) return url;

    // Already has a format/codec transform
    if (/\/upload\/[^/]*f_/.test(u.pathname) || /\/upload\/[^/]*vc_/.test(u.pathname)) {
      return url;
    }

    u.pathname = u.pathname.replace(
      "/video/upload/",
      "/video/upload/f_mp4,vc_h264,q_auto/"
    );
    return u.toString();
  } catch {
    return url;
  }
}
