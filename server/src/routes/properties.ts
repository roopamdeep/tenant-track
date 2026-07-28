import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireLandlord, AuthRequest } from "../middleware/auth";

const router = Router();

// Get all properties for landlord
router.get(
  "/",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const properties = await prisma.property.findMany({
        where: { landlordId: req.userId },
        include: { units: true },
      });
      res.json({ properties });
    } catch {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  },
);

// Create a property
router.post(
  "/",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, address } = req.body;
      const property = await prisma.property.create({
        data: { name, address, landlordId: req.userId! },
      });
      res.json({ property });
    } catch {
      res.status(500).json({ error: "Failed to create property" });
    }
  },
);

// Delete a property
router.delete(
  "/:id",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      await prisma.property.delete({
        where: { id: req.params.id as string, landlordId: req.userId },
      });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete property" });
    }
  },
);

export default router;
