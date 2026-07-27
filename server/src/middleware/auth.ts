import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireLandlord(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.role !== "LANDLORD") {
    res.status(403).json({ error: "Landlord access required" });
    return;
  }
  next();
}

export function requireTenant(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.role !== "TENANT") {
    res.status(403).json({ error: "Tenant access required" });
    return;
  }
  next();
}
