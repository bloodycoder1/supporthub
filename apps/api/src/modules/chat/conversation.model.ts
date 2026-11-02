
import mongoose, { Schema, type Model } from "mongoose";

export interface Conversation {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<Conversation>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

conversationSchema.index({
  workspaceId: 1,
  userId: 1,
  lastMessageAt: -1,
});

export const ConversationModel: Model<Conversation> =
  (mongoose.models.Conversation as Model<Conversation>) ||
  mongoose.model<Conversation>(
    "Conversation",
    conversationSchema,
  );
