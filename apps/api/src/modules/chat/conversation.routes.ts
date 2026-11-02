
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";

import {
  createConversationController,
  listConversationsController,
  getMessagesController,  deleteConversationController
} from "./conversation.controller";


const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", createConversationController);

router.get("/", listConversationsController);

router.get(
  "/:conversationId/messages",
  getMessagesController,
);

router.delete(
  "/:conversationId",
  deleteConversationController,
);

export { router as conversationRouter };
