
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { answerController } from "./answer.controller";

const router = Router({ mergeParams: true });

router.post("/", authenticate, answerController);

export { router as chatRouter };
