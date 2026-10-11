import express from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/requireRole.js";

import {
  handleDeleteKnowledgeDocument,
  handleGetKnowledgeDocument,
  handleListKnowledgeDocuments,
  handleSetKnowledgeEnabled,
  handleUploadKnowledgeDocument,
  handleSetKnowledgeAccess,
} from "../controllers/knowledgeController.js";

import {
  uploadKnowledgePdf,
} from "../middleware/uploadKnowledgePdf.js";

const router = express.Router();

router.post(
  "/upload",
  requireAuth,
  requireRole("ADMIN"),
  uploadKnowledgePdf.single("file"),
  handleUploadKnowledgeDocument,
);

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  handleListKnowledgeDocuments,
);

router.get(
  "/:documentId",
  requireAuth,
  requireRole("ADMIN"),
  handleGetKnowledgeDocument,
);

router.patch(
  "/:documentId/enabled",
  requireAuth,
  requireRole("ADMIN"),
  handleSetKnowledgeEnabled,
);

router.patch(
  "/:documentId/access",
  requireAuth,
  requireRole("ADMIN"),
  handleSetKnowledgeAccess,
);

router.delete(
  "/:documentId",
  requireAuth,
  requireRole("ADMIN"),
  handleDeleteKnowledgeDocument,
);



export default router;