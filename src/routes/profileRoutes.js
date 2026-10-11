import express from "express";

import {
  handleGetProfile,
  handleUpdateProfile,
} from "../controllers/profileController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, handleGetProfile);
router.patch("/", requireAuth, handleUpdateProfile);

export default router;