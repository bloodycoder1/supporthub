
import mongoose from "mongoose";
import { DocumentModel } from "./document.model";
import { DocumentChunkModel } from "./document-chunk.model";
import type { TextChunk } from "./document.chunker";

export interface EmbeddedTextChunk extends TextChunk {
  embedding: number[];
}

export async function saveDocumentChunks(
  workspaceId: string,
  documentId: string,
  chunks: EmbeddedTextChunk[],
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
          workspaceId: workspaceObjectId,
          documentId: documentObjectId,
          index: chunk.index,
        },
        update: {
          $set: {
            content: chunk.content,
            embedding: chunk.embedding,
          },
          $setOnInsert: {
            workspaceId: workspaceObjectId,
            documentId: documentObjectId,
            index: chunk.index,
          },
        },
        upsert: true,
      },
    })),
  );

  // Remove stale chunks after reprocessing a shorter document.
  await DocumentChunkModel.deleteMany({
    workspaceId: workspaceObjectId,
    documentId: documentObjectId,
    index: { $gte: chunks.length },
  });
  console.log("[Embedding] Chunks saved to MongoDB"); 
}
