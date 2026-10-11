import { supabaseAdmin } from "../config/supabaseAdmin.js";

const DEFAULT_MESSAGE_LIMIT = 20;
const MAX_MESSAGE_LIMIT = 100;

const ALLOWED_ROLES = new Set([
  "USER",
  "ASSISTANT",
]);

const ALLOWED_PROCESSING_STATUSES = new Set([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

function normalizeMessageLimit(limit) {
  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    return DEFAULT_MESSAGE_LIMIT;
  }

  return Math.min(parsedLimit, MAX_MESSAGE_LIMIT);
}

async function createMessage({
  conversationId,
  role,
  content,
  clientMessageId = null,
  processingStatus = "COMPLETED",
  errorCode = null,
}) {
  if (!conversationId) {
    throw new Error("Conversation ID is required.");
  }

  if (!ALLOWED_ROLES.has(role)) {
    throw new Error(`Invalid message role: ${role}`);
  }

  if (typeof content !== "string") {
    throw new Error("Message content must be a string.");
  }

  if (
    !ALLOWED_PROCESSING_STATUSES.has(processingStatus)
  ) {
    throw new Error(
      `Invalid processing status: ${processingStatus}`
    );
  }

  const normalizedContent = content.trim();

  /*
   * A PROCESSING assistant placeholder may initially have
   * empty content. Completed user and assistant messages may not.
   */
  if (
    !normalizedContent &&
    processingStatus !== "PROCESSING"
  ) {
    throw new Error(
      "Message content cannot be empty unless it is processing."
    );
  }

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content: normalizedContent,
      client_message_id: clientMessageId,
      processing_status: processingStatus,
      error_code: errorCode,
    })
    .select("*")
    .single();

  if (error) {
    /*
     * PostgreSQL code 23505 means unique constraint violation.
     * This can occur when the same clientMessageId is retried.
     */
    if (error.code === "23505" && clientMessageId) {
      const existingMessage =
        await findMessageByClientMessageId(
          conversationId,
          clientMessageId
        );

      if (existingMessage) {
        return existingMessage;
      }
    }

    throw new Error(
      `Failed to create message: ${error.message}`
    );
  }

  return data;
}

async function findMessageById(messageId) {
  if (!messageId) {
    throw new Error("Message ID is required.");
  }

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("id", messageId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find message: ${error.message}`
    );
  }

  return data;
}

async function findMessageByClientMessageId(
  conversationId,
  clientMessageId
) {
  if (!conversationId || !clientMessageId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("client_message_id", clientMessageId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find client message: ${error.message}`
    );
  }

  return data;
}

async function listMessages(
  conversationId,
  {
    limit = DEFAULT_MESSAGE_LIMIT,
    before = null,
    ascending = true,
  } = {}
) {
  if (!conversationId) {
    throw new Error("Conversation ID is required.");
  }

  const safeLimit = normalizeMessageLimit(limit);

  let query = supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending,
    })
    .limit(safeLimit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Failed to list messages: ${error.message}`
    );
  }

  return data ?? [];
}

/*
 * Gets the most recent messages, then returns them
 * in chronological order for the AI prompt.
 */
async function listRecentMessages(
  conversationId,
  limit = 10
) {
  const messages = await listMessages(
    conversationId,
    {
      limit,
      ascending: false,
    }
  );

  return messages.reverse();
}

async function updateMessage(
  messageId,
  updates
) {
  if (!messageId) {
    throw new Error("Message ID is required.");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("Message updates are required.");
  }

  if (
    updates.processingStatus !== undefined &&
    !ALLOWED_PROCESSING_STATUSES.has(
      updates.processingStatus
    )
  ) {
    throw new Error(
      `Invalid processing status: ${updates.processingStatus}`
    );
  }

  const allowedUpdates = {
    content: updates.content,
    processing_status: updates.processingStatus,
    error_code: updates.errorCode,
  };

  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key] === undefined) {
      delete allowedUpdates[key];
    }
  });

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error(
      "No valid message updates were provided."
    );
  }

  const { data, error } = await supabaseAdmin
    .from("messages")
    .update(allowedUpdates)
    .eq("id", messageId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to update message: ${error.message}`
    );
  }

  return data;
}

async function markMessageCompleted(
  messageId,
  content
) {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(
      "Completed assistant content is required."
    );
  }

  return updateMessage(messageId, {
    content: content.trim(),
    processingStatus: "COMPLETED",
    errorCode: null,
  });
}

async function markMessageFailed(
  messageId,
  errorCode = "UNKNOWN_ERROR"
) {
  return updateMessage(messageId, {
    processingStatus: "FAILED",
    errorCode,
  });
}

async function findPreviousUserMessage(
  conversationId,
  assistantMessageCreatedAt,
) {
  const {data, error} = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("role", "USER")
    .lt("created_at", assistantMessageCreatedAt)
    .order("created_at", {ascending: false})
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to find previous user message: ${error.message}`,
    );
  }

  return data;
}

export {
  createMessage,
  findMessageByClientMessageId,
  findMessageById,
  listMessages,
  listRecentMessages,
  markMessageCompleted,
  markMessageFailed,
  updateMessage,
  findPreviousUserMessage,
};