
import mongoose from "mongoose";
import { DocumentModel } from "./document.model";
import { extractDocumentText } from "./document.extractor";
import { splitTextIntoChunks } from "./document.chunker";
import { saveDocumentChunks } from "./document-chunk.service";

export async function processDocument(
  workspaceId: string,
  documentId: string,
): Promise<void> {
  if (
    !mongoose.isValidObjectId(workspaceId) ||
    !mongoose.isValidObjectId(documentId)
  ) {
    throw new Error("Invalid workspace or document ID");
  }

  const document = await DocumentModel.findOne({
    _id: documentId,
    workspaceId,
  });

  if (!document) {
    throw new Error("Document not found in workspace");
  }

  try {
    document.status = "processing";
    document.errorMessage = undefined;
    await document.save();

    const text = await extractDocumentText(
      document.storageKey,
      document.mimeType,
    );

    const chunks = splitTextIntoChunks(text);

    if (chunks.length === 0) {
      throw new Error("Document contains no extractable text");
    }

    await saveDocumentChunks(
      workspaceId,
      documentId,
      chunks,
    );

    document.status = "ready";
    document.errorMessage = undefined;
    await document.save();
  } catch (error) {
    document.status = "failed";
    document.errorMessage =
      error instanceof Error
        ? error.message.slice(0, 500)
        : "Document processing failed";

    await document.save();
    throw error;
  }
}
