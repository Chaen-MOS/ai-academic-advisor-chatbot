import express from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {

  handleListConversations,
  handleDeleteConversation,
  handleGetMessages,
  handleRetryMessage,

} from "../controllers/conversationController.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  handleListConversations,
);

router.get(
  "/:conversationId/messages",
  requireAuth,
  handleGetMessages,
);

router.delete(
  "/:conversationId",
  requireAuth,
  handleDeleteConversation
);

router.post(
  "/:conversationId/messages/:assistantMessageId/retry",
  requireAuth,
  handleRetryMessage,
);

export default router;