
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { searchWorkspaceDocuments } from "./semantic-search.service";
import { WorkspaceModel } from "../workspaces/workspace.model";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";

export async function searchWorkspaceController(
 req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const query = req.query.q;
    const limitValue = req.query.limit;

    if (
      typeof workspaceId !== "string" ||
      !mongoose.isValidObjectId(workspaceId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid workspace ID",
      });
      return;
    }

    if (typeof query !== "string" || !query.trim()) {
      res.status(400).json({
        success: false,
        message: "A non-empty search query is required",
      });
      return;
    }

    if (query.length > 500) {
      res.status(400).json({
        success: false,
        message: "Search query must be 500 characters or fewer",
      });
      return;
    }

    const limit = limitValue === undefined ? 5 : Number(limitValue);

    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      res.status(400).json({
        success: false,
        message: "Limit must be an integer between 1 and 20",
      });
      return;
    }

    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      ownerId: userId,
    })
      .select("_id")
      .lean();

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    const results = await searchWorkspaceDocuments(
      workspaceId,
      query,
      limit,
    );

    res.status(200).json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
}
