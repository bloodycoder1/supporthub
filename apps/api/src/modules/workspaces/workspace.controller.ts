
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { createWorkspaceSchema } from "./workspace.validation";
import { createWorkspace } from "./workspace.service";
import { getUserWorkspaces } from "./workspace.service";
import { getWorkspaceById } from "./workspace.service";
// Keep your existing createWorkspaceController.


export async function getWorkspaceByIdController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { workspaceId } = req.params;

if (!workspaceId) {
  res.status(400).json({
    success: false,
    message: "Workspace ID is required",
  });
  return;
}

const workspace = await getWorkspaceById(
  workspaceId,
  req.userId
);

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
}


export async function getWorkspacesController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const workspaces = await getUserWorkspaces(req.userId);

    res.status(200).json({
      success: true,
      data: { workspaces },
    });
  } catch (error) {
    next(error);
  }
}


export async function createWorkspaceController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const result = createWorkspaceSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid workspace data",
        errors: result.error.flatten(),
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const workspace = await createWorkspace(
      result.data,
      req.userId
    );

    res.status(201).json({
      success: true,
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
}
