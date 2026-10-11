import {
  getUserConversations,
  getConversationMessages,
  removeConversation,
} from "../conversations/conversationService.js";
import { retryAssistantMessage, } from "../services/chatService.js";

async function handleListConversations(req, res) {
  try {
    const userId = req.user.id;

    const conversations =
      await getUserConversations(userId);

    return res.json({
      conversations: conversations.map(conversation => ({
        id: conversation.id,
        title: conversation.title,
        titleStatus: conversation.title_status,
        lastMessagePreview:
          conversation.last_message_preview,
        messageCount:
          conversation.message_count,
        createdAt:
          conversation.created_at,
        lastMessageAt:
          conversation.last_message_at,
      })),
    });

  } catch (error) {

    console.error(
      "List Conversations Error:",
      error,
    );

    return res.status(500).json({
      error:
        "Failed to load conversations.",
      code:
        "CONVERSATION_LIST_FAILED",
    });

  }
}

async function handleGetMessages(req, res) {

  try {

    const userId = req.user.id;

    const {conversationId} = req.params;

    const result =
      await getConversationMessages({

        conversationId,

        userId,

      });

    return res.json({

      conversation: {

        id: result.conversation.id,

        title: result.conversation.title,

        titleStatus:
          result.conversation.title_status,

      },

      messages:

        result.messages.map(message => ({

          id: message.id,

          role: message.role,

          content: message.content,

          processingStatus:
            message.processing_status,

          createdAt:
            message.created_at,

        })),

    });

  } catch (error) {

    console.error(
      "Get Messages Error:",
      error,
    );

    if (
      error.code ===
      "CONVERSATION_NOT_FOUND"
    ) {

      return res.status(404).json({

        error:
          "Conversation not found.",

        code:
          "CONVERSATION_NOT_FOUND",

      });

    }

    return res.status(500).json({

      error:
        "Failed to load messages.",

      code:
        "MESSAGE_LIST_FAILED",

    });

  }

}

async function handleDeleteConversation(req, res) {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const deletedConversation =
      await removeConversation(
        conversationId,
        userId,
      );

    if (!deletedConversation) {
      return res.status(404).json({
        error: "Conversation not found.",
        code: "CONVERSATION_NOT_FOUND",
      });
    }

    return res.json({
      success: true,
      conversationId:
        deletedConversation.id,
    });
  } catch (error) {
    console.error(
      "Delete Conversation Error:",
      error,
    );

    if (
      error.code ===
      "CONVERSATION_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: "Conversation not found.",
        code: "CONVERSATION_NOT_FOUND",
      });
    }

    return res.status(500).json({
      error:
        "Failed to delete conversation.",
      code:
        "CONVERSATION_DELETE_FAILED",
    });
  }
}

async function handleRetryMessage(req, res) {
  try {
    const userId = req.user.id;
    const {
      conversationId,
      assistantMessageId,
    } = req.params;

    const assistantMessage =
      await retryAssistantMessage({
        conversationId,
        assistantMessageId,
        authenticatedUserId: userId,
      });

    return res.json({
      assistantMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        processingStatus:
          assistantMessage.processing_status,
        createdAt: assistantMessage.created_at,
      },
    });
  } catch (error) {
    console.error("Retry Message Error:", error);

    const status =
      error.code === "CONVERSATION_NOT_FOUND" ||
      error.code === "FAILED_MESSAGE_NOT_FOUND"
        ? 404
        : 500;

    return res.status(status).json({
      error:
        status === 404
          ? "Message not found."
          : "Failed to retry message.",
      message:
        error instanceof Error
          ? error.message
          : undefined,
      code:
        error.code ?? "MESSAGE_RETRY_FAILED",
    });
  }
}

export {

  handleListConversations,
  handleDeleteConversation,
  handleGetMessages,
  handleRetryMessage,

};