
import mongoose from "mongoose";
import { DocumentModel } from "./document.model";
import { DocumentChunkModel } from "./document-chunk.model";
import type { TextChunk } from "./document.chunker";

export async function saveDocumentChunks(
  workspaceId: string,
  documentId: string,
  chunks: TextChunk[],
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
  })
    .select("_id workspaceId")
    .lean();

  if (!document) {
    throw new Error("Document not found in this workspace");
  }

  if (chunks.length === 0) {
    throw new Error("Cannot save an empty set of chunks");
  }

  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const documentObjectId = new mongoose.Types.ObjectId(documentId);

  await DocumentChunkModel.bulkWrite(
    chunks.map((chunk) => ({
      updateOne: {
        filter: {
          documentId: documentObjectId,
          index: chunk.index,
        },
        update: {
          $set: {
            workspaceId: workspaceObjectId,
            content: chunk.content,
          },
        },
        upsert: true,
      },
    })),
  );

  // Remove stale chunks if a document was reprocessed into fewer chunks.
  await DocumentChunkModel.deleteMany({
    workspaceId: workspaceObjectId,
    documentId: documentObjectId,
    index: { $gte: chunks.length },
  });
}
