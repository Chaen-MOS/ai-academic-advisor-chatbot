import {
  createSupportTicket,
  deleteSupportTicket,
  findSupportTicketById,
  listAllSupportTickets,
  listUserSupportTickets,
  updateSupportTicket,
} from "./supportTicketRepository.js";
import {
  getStudentProfile,
} from "../profiles/studentProfileService.js";

const VALID_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
];

function createSupportError(
  message,
  code,
) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function validateRequiredText(
  value,
  fieldName,
  code,
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw createSupportError(
      `${fieldName} is required.`,
      code,
    );
  }
}

async function submitSupportTicket(
  userId,
  input,
) {
  validateRequiredText(
    input.subject,
    "Subject",
    "SUPPORT_SUBJECT_REQUIRED",
  );

  validateRequiredText(
    input.message,
    "Message",
    "SUPPORT_MESSAGE_REQUIRED",
  );

  return createSupportTicket({
    userId,

    subject:
      input.subject.trim(),

    message:
      input.message.trim(),
  });
}

async function getMySupportTickets(
  userId,
) {
  const tickets =
    await listUserSupportTickets(
      userId,
    );

  return Promise.all(
    tickets.map(enrichTicket),
  );
}

async function getStaffSupportTickets() {
  const tickets =
    await listAllSupportTickets();

  return Promise.all(
    tickets.map(enrichTicket),
  );
}

async function updateSupportTicketAsStaff(
  ticketId,
  staffUserId,
  updates,
) {
  const ticket =
    await findSupportTicketById(
      ticketId,
    );

  if (!ticket) {
    throw createSupportError(
      "Support ticket not found.",
      "SUPPORT_TICKET_NOT_FOUND",
    );
  }

  const payload = {};

  if (
    updates.status !== undefined
  ) {
    if (
      typeof updates.status !==
        "string" ||
      !VALID_STATUSES.includes(
        updates.status,
      )
    ) {
      throw createSupportError(
        "Invalid support ticket status.",
        "INVALID_SUPPORT_STATUS",
      );
    }

    payload.status =
      updates.status;

    if (
      updates.status ===
      "RESOLVED"
    ) {
      payload.resolvedAt =
        new Date().toISOString();
    }
  }

  if (
    updates.lecturerReply !==
    undefined
  ) {
    payload.lecturerReply =
      typeof updates.lecturerReply ===
        "string" &&
      updates.lecturerReply.trim()
        ? updates.lecturerReply.trim()
        : null;
  }

  if (
    updates.assignToMe === true
  ) {
    payload.assignedTo =
      staffUserId;

    if (
      ticket.status === "OPEN" &&
      payload.status === undefined
    ) {
      payload.status =
        "IN_PROGRESS";
    }
  }

  return updateSupportTicket(
    ticketId,
    payload,
  );
}

async function resolveOwnSupportTicket(
  userId,
  ticketId,
) {
  const ticket =
    await findSupportTicketById(
      ticketId,
    );

  if (
    !ticket ||
    ticket.user_id !== userId
  ) {
    throw createSupportError(
      "Support ticket not found.",
      "SUPPORT_TICKET_NOT_FOUND",
    );
  }

  if (
    ticket.status === "RESOLVED"
  ) {
    return ticket;
  }

  return updateSupportTicket(
    ticketId,
    {
      status:
        "RESOLVED",

      resolvedAt:
        new Date().toISOString(),
    },
  );
}

async function removeOwnSupportTicket(
  userId,
  ticketId,
) {
  const ticket =
    await findSupportTicketById(
      ticketId,
    );

  if (
    !ticket ||
    ticket.user_id !== userId
  ) {
    throw createSupportError(
      "Support ticket not found.",
      "SUPPORT_TICKET_NOT_FOUND",
    );
  }

  const deletedTicket =
    await deleteSupportTicket(
      ticketId,
      userId,
    );

  if (!deletedTicket) {
    throw createSupportError(
      "Support ticket not found.",
      "SUPPORT_TICKET_NOT_FOUND",
    );
  }

  return deletedTicket;
}

async function enrichTicket(
  ticket,
) {
  if (!ticket) {
    return null;
  }

  let assignedToName = null;

  if (ticket.assigned_to) {
    try {
      const profile =
        await getStudentProfile(
          ticket.assigned_to,
        );

      assignedToName =
        profile?.preferred_name ||
        profile?.full_name ||
        null;
    } catch {
      assignedToName = null;
    }
  }

  return {
    ...ticket,
    assignedToName,
  };
}

export {
  getMySupportTickets,
  getStaffSupportTickets,
  removeOwnSupportTicket,
  resolveOwnSupportTicket,
  submitSupportTicket,
  updateSupportTicketAsStaff,
};