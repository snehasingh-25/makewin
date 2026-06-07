import express from "express";
import prisma from "../prisma.js";
import { cacheMiddleware } from "../utils/cache.js";
const router = express.Router();

/**
 * Product Recommendation Engine
 * GET /recommendations/:productId?limit=10
 * 
 * Returns 6-10 product recommendations based on the current product
 * Priority: Same category → Price range → Trending → New → Best sellers
 */
router.get("/:productId", cacheMiddleware(10 * 60 * 1000), async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 6), 20);

    // Get the current product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Extract product attributes
    const categoryIds = product.categories.map((pc) => pc.category.id);

    // Build recommendation query with priority
    const recommendations = await getRecommendations(
      productId,
      categoryIds,
      limit
    );

    res.json(recommendations);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

/**
 * Main recommendation algorithm
 */
async function getRecommendations(productId, categoryIds, limit) {
  const recommendations = [];
  const seen = new Set([productId]);

  // Priority 1: Same category
  const sameCategory = await prisma.product.findMany({
    where: {
      id: { not: productId },
      categories: {
        some: {
          categoryId: {
            in: categoryIds,
          },
        },
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [
      { createdAt: "desc" },
    ],
    take: limit,
  });

  for (const p of sameCategory) {
    if (recommendations.length >= limit) break;
    if (!seen.has(p.id)) {
      recommendations.push(p);
      seen.add(p.id);
    }
  }

  // Priority 2: Any product if still needed
  if (recommendations.length < limit) {
    const anyProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    for (const p of anyProducts) {
      if (recommendations.length >= limit) break;
      if (!seen.has(p.id)) {
        recommendations.push(p);
        seen.add(p.id);
      }
    }
  }

  return recommendations.slice(0, limit);
}

export default router;
