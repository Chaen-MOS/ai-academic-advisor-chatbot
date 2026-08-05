import {
  processUserMessage,
} from "../services/chatService.js";

async function handleChat(req, res) {
  try {
    const {
      conversationId = null,
      clientMessageId,
      message,
    } = req.body;

    const authenticatedUserId =
      req.user.id;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        error: "Message is required.",
        code: "MESSAGE_REQUIRED",
      });
    }

    if (
      typeof clientMessageId !== "string" ||
      !clientMessageId.trim()
    ) {
      return res.status(400).json({
        error:
          "Client message ID is required.",
        code:
          "CLIENT_MESSAGE_ID_REQUIRED",
      });
    }

    const result =
      await processUserMessage({
        userInput: message.trim(),
        authenticatedUserId,
        conversationId:
          conversationId || null,
        clientMessageId:
          clientMessageId.trim(),
      });

    return res.status(200).json({
      conversation: {
        id: result.conversation.id,
        title: result.conversation.title,
        titleStatus:
          result.conversation.title_status,
        lastMessagePreview:
          result.conversation
            .last_message_preview,
        messageCount:
          result.conversation.message_count,
        lastMessageAt:
          result.conversation
            .last_message_at,
      },

      wasCreated:
        result.wasCreated,

      userMessage: {
        id: result.userMessage.id,
        role: result.userMessage.role,
        content:
          result.userMessage.content,
        processingStatus:
          result.userMessage
            .processing_status,
        createdAt:
          result.userMessage.created_at,
      },

      assistantMessage: {
        id:
          result.assistantMessage.id,
        role:
          result.assistantMessage.role,
        content:
          result.assistantMessage.content,
        processingStatus:
          result.assistantMessage
            .processing_status,
        createdAt:
          result.assistantMessage
            .created_at,
      },
    });
  } catch (error) {
    console.error(
      "Chat API Error:",
      error,
    );

    const statusCode =
      error.code ===
      "CONVERSATION_NOT_FOUND"
        ? 404
        : 500;

    return res.status(statusCode).json({
      error:
        statusCode === 404
          ? "Conversation not found."
          : "Failed to process chat message.",

      message:
        error instanceof Error
          ? error.message
          : undefined,

      code:
        error.code ??
        "CHAT_PROCESSING_FAILED",

      conversationId:
        error.conversationId ??
        null,

      userMessageId:
        error.userMessageId ??
        null,

      assistantMessageId:
        error.assistantMessageId ??
        null,
    });
  }
}

export { handleChat };