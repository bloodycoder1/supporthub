
import mongoose from "mongoose";
import {ConversationModel,} from "./conversation.model";
import { MessageModel,type MessageRole,type MessageSource,} from "./message.model";

function validateObjectIds(...ids: string[]): void {
  if (!ids.every((id) => mongoose.isValidObjectId(id))) {
    throw new Error("Invalid ID provided");
  }
}

// 1. Create a conversation
export async function createConversation(
  workspaceId: string,
  userId: string,
  title: string,
) {
  validateObjectIds(workspaceId, userId);

  const normalizedTitle = title.trim();

  if (!normalizedTitle || normalizedTitle.length > 150) {
    throw new Error("Title must contain 1-150 characters");
  }

  return ConversationModel.create({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
    userId: new mongoose.Types.ObjectId(userId),
    title: normalizedTitle,
  });
}

// 2. Save a message
export async function saveMessage(
  conversationId: string,
  workspaceId: string,
  role: MessageRole,
  content: string,
  sources: MessageSource[] = [],
) {
  validateObjectIds(conversationId, workspaceId);

  const normalizedContent = content.trim();

  if (!normalizedContent) {
    throw new Error("Message content cannot be empty");
  }

  if (!["user", "assistant"].includes(role)) {
    throw new Error("Invalid message role");
  }

  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    workspaceId,
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const message = await MessageModel.create({
    conversationId: conversation._id,
    workspaceId: conversation.workspaceId,
    role,
    content: normalizedContent,
    sources,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  return message;
}

// 3. List conversations in a workspace
export async function getWorkspaceConversations(
  workspaceId: string,
  userId: string,
  page = 1,
  limit = 20,
) {
  validateObjectIds(workspaceId, userId);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50
  ) {
    throw new Error("Invalid pagination parameters");
  }

  const filter = {
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
    userId: new mongoose.Types.ObjectId(userId),
  };

  const [conversations, total] = await Promise.all([
    ConversationModel.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    ConversationModel.countDocuments(filter),
  ]);

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
export async function deleteConversation(
  conversationId: string,
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  validateObjectIds(conversationId, workspaceId, userId);

  // Verify that the conversation belongs to this user and workspace.
  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    workspaceId,
    userId,
  });

  if (!conversation) {
    return false;
  }

  // Delete all messages belonging to this conversation.
  await MessageModel.deleteMany({
    conversationId: conversation._id,
    workspaceId: conversation.workspaceId,
  });

  // Delete the conversation itself.
  await ConversationModel.deleteOne({
    _id: conversation._id,
    workspaceId: conversation.workspaceId,
    userId: conversation.userId,
  });

  return true;
}

// 4. Retrieve messages from a conversation
export async function getConversationMessages(
  conversationId: string,
  workspaceId: string,
  userId: string,
  page = 1,
  limit = 50,
) {
  validateObjectIds(conversationId, workspaceId, userId);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new Error("Invalid pagination parameters");
  }

  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    workspaceId,
    userId,
  }).select("_id");

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const [messages, total] = await Promise.all([
    MessageModel.find({
      conversationId: conversation._id,
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    MessageModel.countDocuments({
      conversationId: conversation._id,
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    }),
  ]);

  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
