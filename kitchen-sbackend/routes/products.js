import express from "express";
import { verifyToken } from "../utils/auth.js";
import { uploadProductMedia, getImageUrl, getVideoUrl } from "../utils/upload.js";
import prisma from "../prisma.js";
import { cacheMiddleware, invalidateCache } from "../utils/cache.js";
const router = express.Router();

function parseBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

// Fisher-Yates shuffle algorithm for randomizing array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get filter options dynamically based on available products (Showcase Mode: only categories)
router.get("/filters", cacheMiddleware(5 * 60 * 1000), async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    res.json({
      categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (public) - Cached for 5 minutes (unless shuffle is enabled)
router.get("/", (req, res, next) => {
  const shouldShuffle = req.query.shuffle !== "false";
  if (shouldShuffle) {
    return next(); // Skip cache middleware
  }
  return cacheMiddleware(5 * 60 * 1000)(req, res, next);
}, async (req, res) => {
  try {
    const { category, search, shuffle, sort } = req.query;
    const limitRaw = req.query.limit;
    const offsetRaw = req.query.offset;
    const limit = typeof limitRaw === "string" ? Math.min(Math.max(parseInt(limitRaw, 10) || 0, 0), 50) : 0;
    const offset = typeof offsetRaw === "string" ? Math.max(parseInt(offsetRaw, 10) || 0, 0) : 0;
    
    const shouldShuffle = shuffle !== "false";
    
    const where = {};
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { name: { startsWith: search } },
      ];
    }

    const include = {
      categories: {
        include: {
          category: true,
        },
      },
    };

    let orderBy = [{ order: "asc" }, { createdAt: "desc" }];
    if (sort === "newest") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sort === "popularity") {
      orderBy = [{ order: "asc" }, { createdAt: "desc" }];
    }

    const queryBase = {
      where,
      include,
      orderBy: shouldShuffle && !sort ? undefined : orderBy,
    };

    let products = [];
    let total = 0;

    if (shouldShuffle && !sort) {
      const allProducts = await prisma.product.findMany({
        where,
        include,
      });
      total = allProducts.length;
      const shuffled = shuffleArray(allProducts);
      if (limit > 0) {
        products = shuffled.slice(offset, offset + limit);
        res.setHeader("X-Total-Count", String(total));
        res.setHeader("X-Limit", String(limit));
        res.setHeader("X-Offset", String(offset));
      } else {
        products = shuffled;
      }
    } else {
      if (limit > 0) {
        const [items, count] = await prisma.$transaction([
          prisma.product.findMany({
            ...queryBase,
            skip: offset,
            take: limit,
          }),
          prisma.product.count({ where }),
        ]);
        products = items;
        total = count;
        res.setHeader("X-Total-Count", String(total));
        res.setHeader("X-Limit", String(limit));
        res.setHeader("X-Offset", String(offset));
      } else {
        products = await prisma.product.findMany(queryBase);
        total = products.length;
      }
    }

    let parsed = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      videos: p.videos ? JSON.parse(p.videos) : [],
      keywords: p.keywords ? JSON.parse(p.keywords) : [],
      categories: p.categories ? p.categories.map(pc => pc.category) : [],
    }));

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function resolveProductImageUrls({ existingImages, imageOrder, imageFiles = [] }) {
  const ordered = imageOrder ? (typeof imageOrder === "string" ? JSON.parse(imageOrder) : imageOrder) : null;
  const files = Array.isArray(imageFiles) ? imageFiles : [];

  if (Array.isArray(ordered) && ordered.length > 0) {
    const imageUrls = [];
    let fileIndex = 0;

    for (const entry of ordered) {
      if (entry === "NEW") {
        if (fileIndex < files.length) {
          imageUrls.push(files[fileIndex]);
          fileIndex++;
        }
      } else if (typeof entry === "string" && entry.length > 0) {
        imageUrls.push(entry);
      }
    }

    return imageUrls;
  }

  const baseImages = existingImages ? (typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages) : [];
  return [...(Array.isArray(baseImages) ? baseImages : []), ...files];
}

// Get single product (public) - Cached for 5 minutes
router.get("/:id", cacheMiddleware(5 * 60 * 1000), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { 
        categories: {
          include: {
            category: true
          }
        }
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      videos: product.videos ? JSON.parse(product.videos) : [],
      keywords: product.keywords ? JSON.parse(product.keywords) : [],
      categories: product.categories ? product.categories.map(pc => pc.category) : [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add product (Admin only)
router.post("/", verifyToken, uploadProductMedia, async (req, res) => {
  try {
    invalidateCache("/products");
    
    const { name, description, categoryIds, keywords, existingImages, existingVideos, isFeatured } = req.body;

    const imageFiles = req.files?.images || [];
    const uploadedImageUrls = [];
    for (const file of imageFiles) {
      const url = await getImageUrl(file);
      uploadedImageUrls.push(url);
    }
    const imageUrls = resolveProductImageUrls({
      existingImages,
      imageOrder: req.body.imageOrder,
      imageFiles: uploadedImageUrls,
    });

    let videoUrls = [];
    if (existingVideos) {
      try {
        const parsed = typeof existingVideos === "string" ? JSON.parse(existingVideos) : existingVideos;
        if (Array.isArray(parsed)) videoUrls = parsed;
      } catch (_) {}
    }
    const videoFiles = req.files?.videos || [];
    for (const file of videoFiles) {
      const url = await getVideoUrl(file);
      videoUrls.push(url);
    }

    const keywordsArray = keywords ? JSON.parse(keywords) : [];
    const categoryIdsArray = categoryIds ? JSON.parse(categoryIds) : [];
    const featured = parseBoolean(isFeatured);

    const product = await prisma.product.create({
      data: {
        name,
        description,
        images: JSON.stringify(imageUrls),
        videos: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null,
        keywords: JSON.stringify(keywordsArray),
        isFeatured: featured,
        categories: {
          create: categoryIdsArray.map(categoryId => ({
            categoryId: Number(categoryId)
          }))
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      },
    });

    res.json({
      ...product,
      images: imageUrls,
      videos: videoUrls,
      keywords: keywordsArray,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update product (Admin only)
router.put("/:id", verifyToken, uploadProductMedia, async (req, res) => {
  try {
    invalidateCache("/products");
    
    const { name, description, categoryIds, keywords, existingImages, existingVideos, imageOrder, isFeatured } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imageFiles = Array.isArray(req.files?.images) ? req.files.images : (req.files?.images ? [req.files.images] : []);
    const uploadedImageUrls = [];
    for (const file of imageFiles) {
      const url = await getImageUrl(file);
      uploadedImageUrls.push(url);
    }
    const imageUrls = resolveProductImageUrls({
      existingImages,
      imageOrder,
      imageFiles: uploadedImageUrls,
    });

    let videoUrls = existingVideos ? JSON.parse(existingVideos) : [];
    const videoFiles = req.files?.videos || [];
    for (const file of videoFiles) {
      const url = await getVideoUrl(file);
      videoUrls.push(url);
    }

    const keywordsArray = keywords ? JSON.parse(keywords) : [];
    const featured = parseBoolean(isFeatured);

    await prisma.productCategory.deleteMany({
      where: { productId: Number(req.params.id) },
    });

    const categoryIdsArray = categoryIds ? JSON.parse(categoryIds) : [];

    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        description,
        images: JSON.stringify(imageUrls),
        videos: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null,
        keywords: JSON.stringify(keywordsArray),
        isFeatured: featured,
        categories: {
          create: categoryIdsArray.map(categoryId => ({
            categoryId: Number(categoryId)
          }))
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      },
    });

    res.json({
      ...product,
      images: imageUrls,
      videos: videoUrls,
      keywords: keywordsArray,
      categories: product.categories ? product.categories.map(pc => pc.category) : [],
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update order for multiple products (Admin only)
router.post("/reorder", verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }

    const numericId = (id) => {
      const n = Number(id);
      return Number.isInteger(n) && !Number.isNaN(n) ? n : null;
    };
    const validItems = items
      .map((item) => ({ id: numericId(item.id), order: Number(item.order) }))
      .filter((item) => item.id != null);

    if (validItems.length === 0) {
      return res.json({ message: "Order updated successfully" });
    }

    invalidateCache("/products");

    await prisma.$transaction(
      validItems.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error("Reorder products error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product (Admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    invalidateCache("/products");
    
    await prisma.product.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
