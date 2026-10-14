
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { createWorkspaceController } from "./workspace.controller";

const workspaceRouter = Router();

workspaceRouter.post(
  "/",
  authenticate,
  createWorkspaceController
);

export default workspaceRouter;
