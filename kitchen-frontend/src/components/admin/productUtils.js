/**
 * Shared product utilities for the admin panel.
 */

/**
 * Build a clone of a product for the "Duplicate" action.
 * Strips the id so the form treats it as a new product.
 */
export function cloneProductForDuplicate(product) {
  const images = product.images
    ? Array.isArray(product.images)
      ? product.images
      : typeof product.images === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(product.images);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })()
        : []
    : [];
  const videos = product.videos && Array.isArray(product.videos) ? product.videos : [];
  return {
    ...product,
    id: null,
    name: (product.name || "").trim() + " (Copy)",
    images,
    videos,
    sizes:
      product.sizes && product.sizes.length > 0
        ? product.sizes.map((s) => ({
            label: s.label,
            price: s.price,
            originalPrice: s.originalPrice ?? null,
          }))
        : [],
    categories: product.categories || [],
  };
}

/**
 * Parse product images from various formats into an array of URLs.
 */
export function parseProductImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
