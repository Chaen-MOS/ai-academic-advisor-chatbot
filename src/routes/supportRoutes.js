import express from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/requireRole.js";

import {
  handleCreateSupportTicket,
  handleDeleteOwnSupportTicket,
  handleGetMySupportTickets,
  handleGetStaffSupportTickets,
  handleResolveOwnSupportTicket,
  handleUpdateSupportTicketAsStaff,
} from "../controllers/supportTicketController.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/tickets",
  handleCreateSupportTicket,
);

router.get(
  "/tickets/mine",
  handleGetMySupportTickets,
);

router.patch(
  "/tickets/:ticketId/resolve",
  handleResolveOwnSupportTicket,
);

router.delete(
  "/tickets/:ticketId",
  handleDeleteOwnSupportTicket,
);

router.get(
  "/tickets",
  requireRole(
    "LECTURER",
    "ADMIN",
  ),
  handleGetStaffSupportTickets,
);

router.patch(
  "/tickets/:ticketId",
  requireRole(
    "LECTURER",
    "ADMIN",
  ),
  handleUpdateSupportTicketAsStaff,
);

export default router;