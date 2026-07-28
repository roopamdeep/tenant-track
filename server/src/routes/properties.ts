import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireLandlord, AuthRequest } from "../middleware/auth";

const router = Router();

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

router.delete(
  "/:id",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const landlordId = String(req.userId);
      await prisma.property.delete({
        where: { id, landlordId },
      });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete property" });
    }
  },
);

export default router;
