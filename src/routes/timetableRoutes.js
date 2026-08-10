import express from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  handleDeleteTimetableEntry,
  handleGetTimetable,
  handleImportTimetable,
  handlePreviewTimetable,
  handleUpdateTimetableEntry,
} from "../controllers/timetableController.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/preview",
  handlePreviewTimetable,
);

router.post(
  "/import",
  handleImportTimetable,
);

router.get(
  "/",
  handleGetTimetable,
);

router.patch(
  "/:entryId",
  handleUpdateTimetableEntry,
);

router.delete(
  "/:entryId",
  handleDeleteTimetableEntry,
);

export default router;