
import type {Request, Response, NextFunction, } from "express";
import mongoose from "mongoose";
import { WorkspaceModel } from "../workspaces/workspace.model";
import { saveUploadedDocument } from "./document.service";
import { listWorkspaceDocuments } from "./document.service";
import { deleteWorkspaceDocument } from "./document.service";

export async function deleteWorkspaceDocumentController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { workspaceId, documentId } = req.params;

    if (!workspaceId || !documentId) {
      res.status(400).json({
        success: false,
        message: "Workspace ID and document ID are required",
      });
      return;
    }

    const deleted = await deleteWorkspaceDocument(
      workspaceId,
      documentId,
    );

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}



type AuthenticatedRequest = Request & {
  userId?: string;
};


export async function listWorkspaceDocumentsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { workspaceId } = req.params;

    if (!workspaceId) {
      res.status(400).json({
        success: false,
        message: "Workspace ID is required",
      });
      return;
    }

    const documents = await listWorkspaceDocuments(workspaceId);

    res.status(200).json({
      success: true,
      data: { documents },
    });
  } catch (error) {
    next(error);
  }
}


export async function authorizeDocumentUpload(
  req: Request, res: Response, next: NextFunction ) {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const workspaceId = req.params.workspaceId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      !workspaceId ||
      !mongoose.isValidObjectId(workspaceId)
    ) {
      res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    const workspace = await WorkspaceModel.exists({
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

    next();
  } catch (error) {
    next(error);
  }
}

export async function uploadDocumentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as Request & { userId?: string }).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please attach a document using the 'file' field",
      });
      return;
    }

    const workspaceId = req.params.workspaceId;

    if (!workspaceId) {
      res.status(400).json({
        success: false,
        message: "Workspace ID is required",
      });
      return;
    }

    const document = await saveUploadedDocument(
      workspaceId,
      userId,
      req.file
    );

    res.status(201).json({
      success: true,
      data: { document },
    });
  } catch (error) {
    next(error);
  }
}
