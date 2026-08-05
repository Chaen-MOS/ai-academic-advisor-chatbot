import express from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {

  handleListConversations,

  handleGetMessages,

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
export default router;