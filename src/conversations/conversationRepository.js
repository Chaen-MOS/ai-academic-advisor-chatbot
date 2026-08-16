import { supabaseAdmin } from "../config/supabaseAdmin.js";

const DEFAULT_LIST_LIMIT = 30;
const MAX_LIST_LIMIT = 100;

function normalizeLimit(limit) {
  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    return DEFAULT_LIST_LIMIT;
  }

  return Math.min(parsedLimit, MAX_LIST_LIMIT);
}

async function createConversation(
  userId,
  initialTitle = "New conversation"
) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const title =
    typeof initialTitle === "string" && initialTitle.trim()
      ? initialTitle.trim()
      : "New conversation";

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert({
      user_id: userId,
      title,
      title_status: "PENDING",
      last_message_preview: null,
      message_count: 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create conversation: ${error.message}`
    );
  }

  return data;
}

async function findConversationById(conversationId) {
  if (!conversationId) {
    throw new Error("Conversation ID is required.");
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find conversation: ${error.message}`
    );
  }

  return data;
}

async function findConversationOwnedByUser(
  conversationId,
  userId
) {
  if (!conversationId) {
    throw new Error("Conversation ID is required.");
  }

  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find owned conversation: ${error.message}`
    );
  }

  return data;
}

async function listConversations(
  userId,
  {
    limit = DEFAULT_LIST_LIMIT,
    includeArchived = false,
  } = {}
) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const safeLimit = normalizeLimit(limit);

  let query = supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("last_message_at", {
      ascending: false,
    })
    .limit(safeLimit);

  if (!includeArchived) {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Failed to list conversations: ${error.message}`
    );
  }

  return data ?? [];
}

async function updateConversation(
  conversationId,
  userId,
  updates
) {
  if (!conversationId) {
    throw new Error("Conversation ID is required.");
  }

  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("Conversation updates are required.");
  }

  const allowedUpdates = {
    title: updates.title,
    title_status: updates.titleStatus,
    last_message_preview: updates.lastMessagePreview,
    message_count: updates.messageCount,
    conversation_summary: updates.conversationSummary,
    last_message_at: updates.lastMessageAt,
    archived_at: updates.archivedAt,
    deleted_at: updates.deletedAt,
    pending_intent: updates.pendingIntent,
    pending_field: updates.pendingField,
  };

  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key] === undefined) {
      delete allowedUpdates[key];
    }
  });

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error("No valid conversation updates were provided.");
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .update(allowedUpdates)
    .eq("id", conversationId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to update conversation: ${error.message}`
    );
  }

  return data;
}

async function softDeleteConversation(
  conversationId,
  userId
) {
  return updateConversation(
    conversationId,
    userId,
    {
      deletedAt: new Date().toISOString(),
    }
  );
}

async function archiveConversation(
  conversationId,
  userId
) {
  return updateConversation(
    conversationId,
    userId,
    {
      archivedAt: new Date().toISOString(),
    }
  );
}

async function restoreConversation(
  conversationId,
  userId
) {
  if (!conversationId || !userId) {
    throw new Error(
      "Conversation ID and User ID are required."
    );
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .update({
      archived_at: null,
    })
    .eq("id", conversationId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to restore conversation: ${error.message}`
    );
  }

  return data;
}

export {
  archiveConversation,
  createConversation,
  findConversationById,
  findConversationOwnedByUser,
  listConversations,
  restoreConversation,
  softDeleteConversation,
  updateConversation,
};