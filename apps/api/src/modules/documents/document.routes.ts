
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { uploadSingleDocument } from "./document.upload";

import {
  authorizeDocumentUpload,
  uploadDocumentController,
  listWorkspaceDocumentsController,
  deleteWorkspaceDocumentController,
  getWorkspaceDocumentController,
} from "./document.controller";

const documentRouter = Router({ mergeParams: true });

documentRouter.get(
  "/",
  authenticate,
  authorizeDocumentUpload,
  listWorkspaceDocumentsController,
);

documentRouter.get(
  "/:documentId",
  authenticate,
  authorizeDocumentUpload,
  getWorkspaceDocumentController,
);


documentRouter.delete(
  "/:documentId",
  authenticate,
  authorizeDocumentUpload,
  deleteWorkspaceDocumentController,
);

documentRouter.post(
  "/",
  authenticate,
  authorizeDocumentUpload,
  uploadSingleDocument,
  uploadDocumentController,
);

export default documentRouter;
