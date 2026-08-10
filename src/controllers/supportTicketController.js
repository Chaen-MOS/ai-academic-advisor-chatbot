import {
  getMySupportTickets,
  getStaffSupportTickets,
  removeOwnSupportTicket,
  resolveOwnSupportTicket,
  submitSupportTicket,
  updateSupportTicketAsStaff,
} from "../support/supportTicketService.js";

function getSupportErrorStatus(
  error,
) {
  if (
    error.code ===
    "SUPPORT_TICKET_NOT_FOUND"
  ) {
    return 404;
  }

  if (
    [
      "SUPPORT_SUBJECT_REQUIRED",
      "SUPPORT_MESSAGE_REQUIRED",
      "INVALID_SUPPORT_STATUS",
    ].includes(error.code)
  ) {
    return 400;
  }

  return 500;
}

async function handleCreateSupportTicket(
  req,
  res,
) {
  try {
    const ticket =
      await submitSupportTicket(
        req.user.id,
        req.body,
      );

    return res
      .status(201)
      .json({
        ticket,
      });
  } catch (error) {
    return res
      .status(
        getSupportErrorStatus(
          error,
        ),
      )
      .json({
        error:
          error.message ??
          "Failed to create support ticket.",
        code:
          error.code ??
          "SUPPORT_CREATE_FAILED",
      });
  }
}

async function handleGetMySupportTickets(
  req,
  res,
) {
  try {
    const tickets =
      await getMySupportTickets(
        req.user.id,
      );

    return res.json({
      tickets,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ??
        "Failed to load support tickets.",
      code:
        "SUPPORT_LIST_FAILED",
    });
  }
}

async function handleGetStaffSupportTickets(
  req,
  res,
) {
  try {
    const tickets =
      await getStaffSupportTickets();

    return res.json({
      tickets,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ??
        "Failed to load support tickets.",
      code:
        "SUPPORT_STAFF_LIST_FAILED",
    });
  }
}

async function handleUpdateSupportTicketAsStaff(
  req,
  res,
) {
  try {
    const ticket =
      await updateSupportTicketAsStaff(
        req.params.ticketId,
        req.user.id,
        req.body,
      );

    return res.json({
      ticket,
    });
  } catch (error) {
    return res
      .status(
        getSupportErrorStatus(
          error,
        ),
      )
      .json({
        error:
          error.message ??
          "Failed to update support ticket.",
        code:
          error.code ??
          "SUPPORT_UPDATE_FAILED",
      });
  }
}

async function handleResolveOwnSupportTicket(
  req,
  res,
) {
  try {
    const ticket =
      await resolveOwnSupportTicket(
        req.user.id,
        req.params.ticketId,
      );

    return res.json({
      ticket,
    });
  } catch (error) {
    return res
      .status(
        getSupportErrorStatus(
          error,
        ),
      )
      .json({
        error:
          error.message ??
          "Failed to resolve support ticket.",
        code:
          error.code ??
          "SUPPORT_RESOLVE_FAILED",
      });
  }
}

async function handleDeleteOwnSupportTicket(
  req,
  res,
) {
  try {
    const ticket =
      await removeOwnSupportTicket(
        req.user.id,
        req.params.ticketId,
      );

    return res.json({
      success: true,
      ticketId:
        ticket.id,
    });
  } catch (error) {
    return res
      .status(
        getSupportErrorStatus(
          error,
        ),
      )
      .json({
        error:
          error.message ??
          "Failed to delete support ticket.",
        code:
          error.code ??
          "SUPPORT_DELETE_FAILED",
      });
  }
}

export {
  handleCreateSupportTicket,
  handleDeleteOwnSupportTicket,
  handleGetMySupportTickets,
  handleGetStaffSupportTickets,
  handleResolveOwnSupportTicket,
  handleUpdateSupportTicketAsStaff,
};