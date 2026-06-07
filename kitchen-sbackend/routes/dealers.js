import express from "express";
import { verifyToken } from "../utils/auth.js";
import upload, { getImageUrl } from "../utils/upload.js";
import prisma from "../prisma.js";

const router = express.Router();

// Multer configuration for uploading up to 2 images
const dealerUpload = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
]);

// Helper to handle safe JSON mapping
function mapDealer(d) {
  return {
    id: d.id,
    city: d.city,
    firm: d.firm,
    address: d.address,
    location: d.location,
    phone: d.phone,
    image1: d.image1 || null,
    image2: d.image2 || null,
  };
}

// 1. GET / - List all dealers (Public)
router.get("/", async (req, res) => {
  try {
    const list = await prisma.dealer.findMany({
      orderBy: [{ city: "asc" }, { firm: "asc" }],
    });
    res.json(list.map(mapDealer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /all - List all dealers (Admin only)
router.get("/all", verifyToken, async (req, res) => {
  try {
    const list = await prisma.dealer.findMany({
      orderBy: [{ city: "asc" }, { firm: "asc" }],
    });
    res.json(list.map(mapDealer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /:id - Get single dealer (Admin only)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }
    res.json(mapDealer(dealer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST / - Create a dealer (Admin only)
router.post("/", verifyToken, dealerUpload, async (req, res) => {
  try {
    const { city, firm, address, location, phone } = req.body;

    if (!city || !firm || !address || !location || !phone) {
      return res.status(400).json({ error: "All text fields are required" });
    }

    let image1Url = null;
    let image2Url = null;

    if (req.files) {
      if (req.files.image1 && req.files.image1[0]) {
        image1Url = await getImageUrl(req.files.image1[0]);
      }
      if (req.files.image2 && req.files.image2[0]) {
        image2Url = await getImageUrl(req.files.image2[0]);
      }
    }

    const dealer = await prisma.dealer.create({
      data: {
        city,
        firm,
        address,
        location,
        phone,
        image1: image1Url,
        image2: image2Url,
      },
    });

    res.status(201).json(mapDealer(dealer));
  } catch (error) {
    console.error("Create dealer error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. PUT /:id - Update a dealer (Admin only)
router.put("/:id", verifyToken, dealerUpload, async (req, res) => {
  try {
    const { city, firm, address, location, phone, existingImage1, existingImage2 } = req.body;
    const dealerId = Number(req.params.id);

    const existingDealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
    });

    if (!existingDealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }

    let image1Url = existingImage1 || existingDealer.image1;
    let image2Url = existingImage2 || existingDealer.image2;

    if (req.files) {
      if (req.files.image1 && req.files.image1[0]) {
        image1Url = await getImageUrl(req.files.image1[0]);
      }
      if (req.files.image2 && req.files.image2[0]) {
        image2Url = await getImageUrl(req.files.image2[0]);
      }
    }

    const updated = await prisma.dealer.update({
      where: { id: dealerId },
      data: {
        city: city || existingDealer.city,
        firm: firm || existingDealer.firm,
        address: address || existingDealer.address,
        location: location || existingDealer.location,
        phone: phone || existingDealer.phone,
        image1: image1Url,
        image2: image2Url,
      },
    });

    res.json(mapDealer(updated));
  } catch (error) {
    console.error("Update dealer error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. DELETE /:id - Delete a dealer (Admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await prisma.dealer.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Dealer deleted successfully" });
  } catch (error) {
    console.error("Delete dealer error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
