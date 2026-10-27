import mongoose from "mongoose";
import { describe, expect, it } from "@jest/globals";
import { splitTextIntoChunks } from "../src/modules/documents/document.chunker";
import { DocumentModel } from "../src/modules/documents/document.model";
import { DocumentChunkModel } from "../src/modules/documents/document-chunk.model";
import { deleteWorkspaceDocument } from "../src/modules/documents/document.service";

describe("splitTextIntoChunks", () => {
  it("returns no chunks for empty text", () => {
    expect(splitTextIntoChunks("   ")).toEqual([]);
  });

  it("splits long text into indexed chunks", () => {
    const text = "word ".repeat(500);

    const chunks = splitTextIntoChunks(text, 500, 50);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.index).toBe(0);
    expect(chunks[1]?.index).toBe(1);
    expect(chunks.every((chunk) => chunk.content.length > 0))
      .toBe(true);
  });

  it("rejects invalid overlap", () => {
    expect(() => splitTextIntoChunks("hello", 100, 100))
      .toThrow();
  });
});

describe("deleteWorkspaceDocument", () => {
  it("deletes the document and cascade deletes its chunks", async () => {
    const workspaceId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const document = await DocumentModel.create({
      workspaceId,
      uploadedBy: userId,
      originalName: "test.txt",
      mimeType: "text/plain",
      size: 100,
      storageKey: "non-existent-file.txt",
      status: "ready",
    });

    await DocumentChunkModel.create([
      {
        workspaceId,
        documentId: document._id,
        content: "First chunk",
        index: 0,
        embedding: [0.1, 0.2, 0.3],
      },
      {
        workspaceId,
        documentId: document._id,
        content: "Second chunk",
        index: 1,
        embedding: [0.4, 0.5, 0.6],
      },
    ]);

    const result = await deleteWorkspaceDocument(
      workspaceId.toString(),
      document._id.toString(),
    );

    expect(result).toBe(true);

    const docAfter = await DocumentModel.findById(document._id);
    expect(docAfter).toBeNull();

    const chunksAfter = await DocumentChunkModel.find({
      documentId: document._id,
    });
    expect(chunksAfter).toHaveLength(0);
  });
});
