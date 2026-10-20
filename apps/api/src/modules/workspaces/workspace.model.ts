
import mongoose, { Schema, type Model } from "mongoose";



export interface Workspace {
  name: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<Workspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);



export const WorkspaceModel: Model<Workspace> =
  (mongoose.models.Workspace as Model<Workspace>) ||
  mongoose.model<Workspace>("Workspace", workspaceSchema);
