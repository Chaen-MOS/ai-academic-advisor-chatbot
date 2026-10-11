import {
  createConversation,
  findConversationOwnedByUser,
  listConversations,
  softDeleteConversation,
  updateConversation,
} from "./conversationRepository.js";

import {
  createMessage,
  listMessages,
  listRecentMessages,
} from "../messages/messageRepository.js";

function createFallbackTitle(message, maxLength = 45) {
  if (typeof message !== "string") {
    return "New conversation";
  }

  const normalizedMessage = message
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedMessage) {
    return "New conversation";
  }

  if (normalizedMessage.length <= maxLength) {
    return normalizedMessage;
  }

  return `${normalizedMessage.slice(0, maxLength).trim()}...`;
}

function createMessagePreview(message, maxLength = 100) {
  if (typeof message !== "string") {
    return "";
  }

  const normalizedMessage = message
    .replace(/\s+/g, " ")
    .trim();

  if (normalizedMessage.length <= maxLength) {
    return normalizedMessage;
  }

  return `${normalizedMessage.slice(0, maxLength).trim()}...`;
}

async function getOrCreateConversation({
  conversationId,
  userId,
  firstMessage,
}) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (conversationId) {
    const existingConversation =
      await findConversationOwnedByUser(
        conversationId,
        userId,
      );

    if (!existingConversation) {
      const error = new Error(
        "Conversation not found or access denied.",
      );

      error.code = "CONVERSATION_NOT_FOUND";
      throw error;
    }

    return {
      conversation: existingConversation,
      wasCreated: false,
    };
  }

  const fallbackTitle =
    createFallbackTitle(firstMessage);

  const newConversation = await createConversation(
    userId,
    fallbackTitle,
  );

  return {
    conversation: newConversation,
    wasCreated: true,
  };
}

async function prepareChatTurn({
  conversationId,
  userId,
  clientMessageId,
  message,
}) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (
    typeof message !== "string" ||
    !message.trim()
  ) {
    throw new Error("Message is required.");
  }

  if (!clientMessageId) {
    throw new Error(
      "Client message ID is required.",
    );
  }

  const normalizedMessage = message.trim();

  const {
    conversation,
    wasCreated,
  } = await getOrCreateConversation({
    conversationId,
    userId,
    firstMessage: normalizedMessage,
  });

  const userMessage = await createMessage({
    conversationId: conversation.id,
    role: "USER",
    content: normalizedMessage,
    clientMessageId,
    processingStatus: "COMPLETED",
  });

  const assistantMessage = await createMessage({
    conversationId: conversation.id,
    role: "ASSISTANT",
    content: "",
    processingStatus: "PROCESSING",
  });

  const nextMessageCount =
    Number(conversation.message_count ?? 0) + 2;

  const updatedConversation =
    await updateConversation(
      conversation.id,
      userId,
      {
        lastMessagePreview:
          createMessagePreview(normalizedMessage),
        messageCount: nextMessageCount,
        lastMessageAt: new Date().toISOString(),
      },
    );

  return {
    conversation:
      updatedConversation ?? conversation,
    wasCreated,
    userMessage,
    assistantMessage,
  };
}

async function getConversationHistoryForPrompt(
  conversationId,
  userId,
  limit = 12,
) {
  const conversation =
    await findConversationOwnedByUser(
      conversationId,
      userId,
    );

  if (!conversation) {
    const error = new Error(
      "Conversation not found or access denied.",
    );

    error.code = "CONVERSATION_NOT_FOUND";
    throw error;
  }

  const messages = await listRecentMessages(
    conversationId,
    limit,
  );

  return {
    conversation,
    messages,
  };
}

async function getConversationMessages({
  conversationId,
  userId,
  limit = 30,
  before = null,
}) {
  const conversation =
    await findConversationOwnedByUser(
      conversationId,
      userId,
    );

  if (!conversation) {
    const error = new Error(
      "Conversation not found or access denied.",
    );

    error.code = "CONVERSATION_NOT_FOUND";
    throw error;
  }

  const messages = await listMessages(
    conversationId,
    {
      limit,
      before,
      ascending: true,
    },
  );

  return {
    conversation,
    messages,
  };
}

async function getUserConversations(
  userId,
  options = {},
) {
  return listConversations(userId, options);
}

async function removeConversation(
  conversationId,
  userId,
) {
  const conversation =
    await findConversationOwnedByUser(
      conversationId,
      userId,
    );

  if (!conversation) {
    const error = new Error(
      "Conversation not found or access denied.",
    );

    error.code = "CONVERSATION_NOT_FOUND";
    throw error;
  }

  return softDeleteConversation(
    conversationId,
    userId,
  );
}

export {
  createFallbackTitle,
  createMessagePreview,
  getConversationHistoryForPrompt,
  getConversationMessages,
  getOrCreateConversation,
  getUserConversations,
  prepareChatTurn,
  removeConversation,
};