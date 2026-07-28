import { Router, Response } from "express";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import { authenticate, requireLandlord, AuthRequest } from "../middleware/auth";

const router = Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/lease/:unitId",
  authenticate,
  requireLandlord,
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const key = `leases/${req.params.unitId}/${Date.now()}-${req.file.originalname}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }),
      );

      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
        }),
        { expiresIn: 3600 },
      );

      res.json({ url, key });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  },
);

export default router;
