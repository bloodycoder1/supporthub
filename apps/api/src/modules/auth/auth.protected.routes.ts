
import { Router } from "express";
import {
  authenticate,
  type AuthenticatedRequest
} from "../../middleware/auth.middleware";

const router = Router();

router.get("/me", authenticate, (req, res) => {
  const authenticatedReq = req as AuthenticatedRequest;

  res.status(200).json({
    success: true,
    data: {
      userId: authenticatedReq.userId
    }
  });
});

export default router;
