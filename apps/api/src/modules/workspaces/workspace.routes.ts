
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import {
  createWorkspaceController,
  getWorkspacesController,
  getWorkspaceByIdController,
} from "./workspace.controller";
const workspaceRouter = Router();

workspaceRouter.post("/", authenticate, createWorkspaceController);
workspaceRouter.get("/", authenticate, getWorkspacesController);
workspaceRouter.get( "/:workspaceId", authenticate,  getWorkspaceByIdController);

export default workspaceRouter;
