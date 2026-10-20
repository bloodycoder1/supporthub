
import { z } from "zod";

export const documentIdSchema = z.object({
  documentId: z.string().regex(
    /^[a-f\d]{24}$/i,
    "Invalid document ID"
  ),
});

export const workspaceDocumentParamsSchema = z.object({
  workspaceId: z.string().regex(
    /^[a-f\d]{24}$/i,
    "Invalid workspace ID"
  ),
});

export const documentUploadLimits = {
  maxFileSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: [
    "application/pdf",
    "text/plain",
    "text/markdown",
  ] as const,
};
