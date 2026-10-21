
import type {Request, Response, NextFunction, } from "express";
import mongoose from "mongoose";
import { WorkspaceModel } from "../workspaces/workspace.model";
import { saveUploadedDocument } from "./document.service";
import { listWorkspaceDocuments } from "./document.service";
import { deleteWorkspaceDocument } from "./document.service";
// import { processDocument } from "./document.processor";
import { getDocumentQueue } from "./document.queue";
import { getWorkspaceDocument } from "./document.service";



export async function getWorkspaceDocumentController(
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

    const document = await getWorkspaceDocument(
      workspaceId,
      documentId,
    );

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { document },
    });
  } catch (error) {
    next(error);
  }
}


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
//  Here we are calling the process document function from the document.processor.ts file
//? await processDocument(workspaceId, document.id);
   
// While adding the BULLMQ we are doing the following changes
const queue = await getDocumentQueue();

await queue.add(
  "process-document",
  {
    workspaceId,
    documentId: document.id,
  },
  {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
);

// ! Bull mQ changes are done here

    // res.status(201).json({
    //   success: true,
    //   data: { document },
    // });
// ! We have retuerned the 202 beacuse we have queued the request not fulfilled

    res.status(202).json({
      success: true,
      message: "Document uploaded and queued for processing",
      data: { document },
    });

  } catch (error) {
    next(error);
  }
}
