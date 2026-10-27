
import mongoose from "mongoose";
import { DocumentChunkModel } from "../documents/document-chunk.model";
import { generateEmbedding } from "./embedding.service";
import { cosineSimilarity } from "./cosine-similarity";

export interface SearchResult {
  content: string;
  documentId: string;
  index: number;
  score: number;
}

export async function searchWorkspaceDocuments(
  workspaceId: string,
  query: string,
  limit = 5,
): Promise<SearchResult[]> {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new Error("Invalid workspace ID");
  }

  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new Error("Search query cannot be empty");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    throw new Error("Limit must be an integer between 1 and 20");
  }

  const queryEmbedding = await generateEmbedding(normalizedQuery);

  const chunks = await DocumentChunkModel.find({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
    embedding: { $exists: true, $ne: [] },
  })
    .select("content documentId index embedding")
    .lean();

  return chunks
    .filter(
      (chunk) =>
        Array.isArray(chunk.embedding) &&
        chunk.embedding.length === queryEmbedding.length,
    )
    .map((chunk) => ({
      content: chunk.content,
      documentId: chunk.documentId.toString(),
      index: chunk.index,
      score: cosineSimilarity(queryEmbedding, chunk.embedding!),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
