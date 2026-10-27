
import { Router } from "express";
import { searchWorkspaceController } from "./search.controller";
import { authenticate } from "./../../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.get("/", authenticate, searchWorkspaceController);

export { router as searchRouter };
