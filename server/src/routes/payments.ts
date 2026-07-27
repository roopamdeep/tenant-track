import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireLandlord, AuthRequest } from "../middleware/auth";

const router = Router();

// Log a payment
router.post(
  "/",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const { unitId, amount, date, note } = req.body;

      const payment = await prisma.payment.create({
        data: {
          unitId,
          userId: req.userId!,
          amount,
          date: new Date(date),
          note,
        },
      });

      res.json({ payment });
    } catch {
      res.status(500).json({ error: "Failed to log payment" });
    }
  },
);

// Get payment history
router.get(
  "/",
  authenticate,
  requireLandlord,
  async (req: AuthRequest, res: Response) => {
    try {
      const payments = await prisma.payment.findMany({
        where: {
          unit: {
            property: { landlordId: req.userId },
          },
        },
        include: {
          unit: { include: { property: true } },
        },
        orderBy: { date: "desc" },
      });

      res.json({ payments });
    } catch {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  },
);

export default router;
