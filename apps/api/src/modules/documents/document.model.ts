
import mongoose, { Schema, type Model } from "mongoose";

export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "ready"
  | "failed";

export interface DocumentRecord {
  workspaceId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<DocumentRecord>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    mimeType: {
      type: String,
      required: true,
      enum: [
        "application/pdf",
        "text/plain",
        "text/markdown",
      ],
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["uploaded", "processing", "ready", "failed"],
      default: "uploaded",
      required: true,
    },
    errorMessage: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

documentSchema.index({ workspaceId: 1, createdAt: -1 });

export const DocumentModel: Model<DocumentRecord> =
  (mongoose.models.Document as Model<DocumentRecord>) ||
  mongoose.model<DocumentRecord>("Document", documentSchema);
