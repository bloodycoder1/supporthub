
import mongoose, { Schema, type Model } from "mongoose";

export type MessageRole = "user" | "assistant";

export interface MessageSource {
  documentId: mongoose.Types.ObjectId;
  index: number;
  score: number;
}

export interface Message {
  conversationId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  role: MessageRole;
  content: string;
  sources: MessageSource[];
  createdAt: Date;
}

const messageSchema = new Schema<Message>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sources: {
      type: [
        {
          documentId: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            required: true,
          },
          index: {
            type: Number,
            required: true,
          },
          score: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

messageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

export const MessageModel: Model<Message> =
  (mongoose.models.Message as Model<Message>) ||
  mongoose.model<Message>("Message", messageSchema);
