import { Router } from "express";
import type { Response } from "express";
import { prisma } from "../lib/prisma";
import {
  authenticate,
  requireLandlord,
  requireTenant,
} from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

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

router.post(
  "/",
  authenticate,
  requireTenant,
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, unitId } = req.body;
      const request = await prisma.maintenanceRequest.create({
        data: { title, description, unitId, userId: req.userId as string },
      });
      res.json({ request });
    } catch {
      res.status(500).json({ error: "Failed to create request" });
    }
  },
);

router.get(
  "/",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const requests = await prisma.maintenanceRequest.findMany({
        where: { unit: { property: { landlordId: req.userId } } },
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

router.patch(
  "/:id",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;

      const request = await prisma.maintenanceRequest.update({
        where: { id: req.params.id as string },
        data: { status },
        include: {
          user: true,
          unit: { include: { property: true } },
        },
      });

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "TenantTrack <onboarding@resend.dev>",
        to: request.user.email,
        subject: `Maintenance Update: ${request.title}`,
        html: `
        <h2>Your maintenance request has been updated</h2>
        <p><strong>Issue:</strong> ${request.title}</p>
        <p><strong>Status:</strong> ${status.replace("_", " ")}</p>
        <p><strong>Property:</strong> ${request.unit.property.name}</p>
        <p><strong>Unit:</strong> ${request.unit.unitNumber}</p>
        <br/>
        <p>Thank you for using TenantTrack!</p>
      `,
      });

      res.json({ request });
    } catch {
      res.status(500).json({ error: "Failed to update request" });
    }
  },
);

export default router;
