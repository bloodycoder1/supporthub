import mongoose from "mongoose";
import type { Response, NextFunction } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { WorkspaceModel } from "../workspaces/workspace.model";

import { searchWorkspaceDocuments } from "./semantic-search.service";
import { generateAnswer } from "./answer.service";

import {
  createConversation,
  saveMessage,
} from "../chat/conversation.service";

import { ConversationModel } from "../chat/conversation.model";

export async function answerController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { workspaceId } = req.params;
    const { question, conversationId } = req.body;
    const userId = req.userId;

    if (!workspaceId || !mongoose.isValidObjectId(workspaceId)) {
      res.status(400).json({
        success: false,
        message: "Invalid workspace ID",
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (
      typeof question !== "string" ||
      !question.trim() ||
      question.trim().length > 500
    ) {
      res.status(400).json({
        success: false,
        message: "Question must be between 1 and 500 characters",
      });
      return;
    }

    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      ownerId: userId,
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    // Create a new conversation or verify the existing one.
    let conversation;

    if (conversationId === undefined) {
      conversation = await createConversation(
        workspaceId,
        userId,
        question.trim().slice(0, 150),
      );
    } else {
      if (
        typeof conversationId !== "string" ||
        !mongoose.isValidObjectId(conversationId)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }

      conversation = await ConversationModel.findOne({
        _id: conversationId,
        workspaceId,
        userId,
      });

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }
    }

    // Retrieve relevant document chunks.
    const searchResult = await searchWorkspaceDocuments(
      workspaceId,
      question.trim(),
      5,
    );

    // Generate the AI response.
    const generated = await generateAnswer(
      question.trim(),
      searchResult,
    );

    // Save the user's question.
    await saveMessage(
      conversation._id.toString(),
      workspaceId,
      "user",
      question.trim(),
    );

    // Save the assistant's response and source references.
    await saveMessage(
      conversation._id.toString(),
      workspaceId,
      "assistant",
      generated.answer,
      generated.sources.map((source) => ({
        documentId: new mongoose.Types.ObjectId(source.documentId),
        index: source.index,
        score: source.score,
      })),
    );

    res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        answer: generated.answer,
        sources: generated.sources.map(
          ({ documentId, index, score }) => ({
            documentId,
            index,
            score,
          }),
        ),
      },
    });
  } catch (error) {
    next(error);
  }
}