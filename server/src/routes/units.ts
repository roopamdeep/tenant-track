import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireLandlord, AuthRequest } from "../middleware/auth";

const router = Router({ mergeParams: true });

// Get all units for a property
router.get(
  "/",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const units = await prisma.unit.findMany({
        where: { propertyId: req.params.propertyId },
        include: { tenantProfile: { include: { user: true } } },
      });
      res.json({ units });
    } catch {
      res.status(500).json({ error: "Failed to fetch units" });
    }
  },
);

// Create a unit
router.post(
  "/",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const { unitNumber, rent } = req.body;
      const unit = await prisma.unit.create({
        data: {
          unitNumber,
          rent,
          propertyId: req.params.propertyId,
        },
      });
      res.json({ unit });
    } catch {
      res.status(500).json({ error: "Failed to create unit" });
    }
  },
);

export default router;
