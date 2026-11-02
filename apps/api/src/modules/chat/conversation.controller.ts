
import type { Response, NextFunction } from "express";
import mongoose from "mongoose";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { WorkspaceModel } from "../workspaces/workspace.model";

import {createConversation,getWorkspaceConversations,getConversationMessages,
} from "./conversation.service";

import { deleteConversation } from "./conversation.service";



async function verifyWorkspaceOwnership(
  workspaceId: string, userId: string,
): Promise<boolean> {
  const workspace = await WorkspaceModel.findOne({
    _id: workspaceId,
    ownerId: userId,
  })
    .select("_id")
    .lean();

  return Boolean(workspace);
}

export async function deleteConversationController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { workspaceId, conversationId } = req.params;
    const userId = req.userId;

    if (
      !workspaceId ||
      !mongoose.isValidObjectId(workspaceId) ||
      !conversationId ||
      !mongoose.isValidObjectId(conversationId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid workspace or conversation ID",
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      ownerId: userId,
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    const deleted = await deleteConversation(
      conversationId,
      workspaceId,
      userId,
    );

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// POST: Create conversation
export async function createConversationController(
  req: AuthenticatedRequest, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.userId;

    if (
      !workspaceId ||
      !mongoose.isValidObjectId(workspaceId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid workspace ID",
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const isOwner = await verifyWorkspaceOwnership(
      workspaceId,
      userId,
    );

    if (!isOwner) {
      res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    const title =
      typeof req.body?.title === "string"
        ? req.body.title
        : "New conversation";

    if (!title.trim() || title.length > 150) {
      res.status(400).json({
        success: false,
        message: "Title must contain 1-150 characters",
      });
      return;
    }

    const conversation = await createConversation(
      workspaceId,
      userId,
      title,
    );

    res.status(201).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
}

// GET: List workspace conversations
export async function listConversationsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = req.userId;

    if (
      !workspaceId ||
      !mongoose.isValidObjectId(workspaceId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid workspace ID",
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const isOwner = await verifyWorkspaceOwnership(
      workspaceId,
      userId,
    );

    if (!isOwner) {
      res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    const page = req.query.page === undefined
      ? 1
      : Number(req.query.page);

    const limit = req.query.limit === undefined
      ? 20
      : Number(req.query.limit);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
      return;
    }

    const result = await getWorkspaceConversations(
      workspaceId,
      userId,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// GET: Retrieve conversation messages
export async function getMessagesController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { workspaceId, conversationId } = req.params;
    const userId = req.userId;

    if (
      !workspaceId ||
      !mongoose.isValidObjectId(workspaceId) ||
      !conversationId ||
      !mongoose.isValidObjectId(conversationId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid workspace or conversation ID",
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const isOwner = await verifyWorkspaceOwnership(
      workspaceId,
      userId,
    );

    if (!isOwner) {
      res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    const page = req.query.page === undefined
      ? 1
      : Number(req.query.page);

    const limit = req.query.limit === undefined
      ? 50
      : Number(req.query.limit);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
      return;
    }

    const result = await getConversationMessages(
      conversationId,
      workspaceId,
      userId,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
