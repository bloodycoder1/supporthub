
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { createWorkspaceSchema } from "./workspace.validation";
import { createWorkspace } from "./workspace.service";

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
