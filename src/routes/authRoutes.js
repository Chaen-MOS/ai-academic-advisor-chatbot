import express from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  handleGetCurrentUser,
} from "../controllers/authController.js";

const router = express.Router();

router.get(
  "/me",
  requireAuth,
  handleGetCurrentUser,
);

export default router;