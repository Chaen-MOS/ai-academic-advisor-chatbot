import {
  supabaseAdmin,
} from "../config/supabaseAdmin.js";

async function createSupportTicket({
  userId,
  subject,
  message,
}) {
  const {data, error} =
    await supabaseAdmin
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject,
        message,
        status: "OPEN",
      })
      .select("*")
      .single();

  if (error) {
    throw new Error(
      `Failed to create support ticket: ${error.message}`,
    );
  }

  return data;
}

async function listUserSupportTickets(
  userId,
) {
  const {data, error} =
    await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw new Error(
      `Failed to load support tickets: ${error.message}`,
    );
  }

  return data ?? [];
}

async function listAllSupportTickets() {
  const {data, error} =
    await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw new Error(
      `Failed to load support tickets: ${error.message}`,
    );
  }

  return data ?? [];
}

async function findSupportTicketById(
  ticketId,
) {
  const {data, error} =
    await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load support ticket: ${error.message}`,
    );
  }

  return data;
}

async function updateSupportTicket(
  ticketId,
  updates,
) {
  const payload = {
    status:
      updates.status,

    assigned_to:
      updates.assignedTo,

    lecturer_reply:
      updates.lecturerReply,

    resolved_at:
      updates.resolvedAt,

    updated_at:
      new Date().toISOString(),
  };

  Object.keys(payload).forEach(
    key => {
      if (
        payload[key] === undefined
      ) {
        delete payload[key];
      }
    },
  );

  const {data, error} =
    await supabaseAdmin
      .from("support_tickets")
      .update(payload)
      .eq("id", ticketId)
      .select("*")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to update support ticket: ${error.message}`,
    );
  }

  return data;
}

async function deleteSupportTicket(
  ticketId,
  userId,
) {
  const {data, error} =
    await supabaseAdmin
      .from("support_tickets")
      .delete()
      .eq("id", ticketId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to delete support ticket: ${error.message}`,
    );
  }

  return data;
}

export {
  createSupportTicket,
  findSupportTicketById,
  listAllSupportTickets,
  listUserSupportTickets,
  updateSupportTicket,
  deleteSupportTicket,
};