import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  authenticate,
  requireLandlord,
  requireTenant,
  AuthRequest,
} from "../middleware/auth";

const router = Router();

// Tenant submits maintenance request
router.post(
  "/",
  authenticate,
  requireTenant,
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, unitId } = req.body;

      const request = await prisma.maintenanceRequest.create({
        data: {
          title,
          description,
          unitId,
          userId: req.userId!,
        },
      });

      res.json({ request });
    } catch {
      res.status(500).json({ error: "Failed to create request" });
    }
  },
);

// Landlord gets all maintenance requests
router.get(
  "/",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const requests = await prisma.maintenanceRequest.findMany({
        where: {
          unit: {
            property: { landlordId: req.userId },
          },
        },
        include: {
          unit: { include: { property: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ requests });
    } catch {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  },
);

// Landlord updates request status
router.patch(
  "/:id",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;

      const request = await prisma.maintenanceRequest.update({
        where: { id: req.params.id },
        data: { status },
      });

      res.json({ request });
    } catch {
      res.status(500).json({ error: "Failed to update request" });
    }
  },
);

// Tenant gets their own requests
router.get(
  "/my",
  authenticate,
  requireTenant,
  async (req: AuthRequest, res: Response) => {
    try {
      const requests = await prisma.maintenanceRequest.findMany({
        where: { userId: req.userId },
        include: { unit: { include: { property: true } } },
        orderBy: { createdAt: "desc" },
      });

      res.json({ requests });
    } catch {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  },
);

export default router;
