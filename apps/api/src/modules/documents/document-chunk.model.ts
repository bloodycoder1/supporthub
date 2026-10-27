
import mongoose, { Schema, type Model } from "mongoose";

export interface DocumentChunk {
  workspaceId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  content: string;
  index: number;
  createdAt: Date;
  updatedAt: Date;
  embedding?: number[];
}

const documentChunkSchema = new Schema<DocumentChunk>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    content: {
      type: String,
      required: true,
      minlength: 1,
    },

    index: {
      type: Number,
      required: true,
      min: 0,
    },
    embedding: {
      type: [Number],
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Keep chunk positions unique within a document.
documentChunkSchema.index(
  { documentId: 1, index: 1 },
  { unique: true },
);

// Efficiently find chunks belonging to a workspace.
documentChunkSchema.index({ workspaceId: 1, documentId: 1 });

export const DocumentChunkModel: Model<DocumentChunk> =
  (mongoose.models.DocumentChunk as Model<DocumentChunk>) ||
  mongoose.model<DocumentChunk>(
    "DocumentChunk",
    documentChunkSchema,
  );
