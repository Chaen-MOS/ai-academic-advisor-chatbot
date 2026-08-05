import {
  getUserConversations,
  getConversationMessages,
} from "../conversations/conversationService.js";

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

export {

  handleListConversations,

  handleGetMessages,

};