import express from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  handleCreateEvent,
  handleDeleteEvent,
  handleGetEvents,
  handleUpdateEvent,
} from "../controllers/eventController.js";

const router = express.Router();

router.use(requireAuth);

router.get(
  "/",
  handleGetEvents,
);

router.post(
  "/",
  handleCreateEvent,
);

router.patch(
  "/:eventId",
  handleUpdateEvent,
);

router.delete(
  "/:eventId",
  handleDeleteEvent,
);

export default router;