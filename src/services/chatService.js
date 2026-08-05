import { getGeminiResponse } from "./geminiService.js";
import buildPrompt from "../prompts/systemPrompt.js";
import { getRelevantContext } from "./ragService.js";
import { generateConversationTitle } from "./conversationTitleService.js";
import {
  prepareChatTurn,
  getConversationHistoryForPrompt,
  createMessagePreview,
} from "../conversations/conversationService.js";
import {
  markMessageCompleted,
  markMessageFailed,
  findMessageById,
  findPreviousUserMessage,
  listRecentMessages,
  listMessages,
} from "../messages/messageRepository.js";
import { getStudentProfile } from "../profiles/studentProfileService.js";
import {
  findConversationOwnedByUser,
  updateConversation,
} from "../conversations/conversationRepository.js";
import { generateConversationSummary, } from "./conversationSummaryService.js";


function buildHistoryText(messages) {
  return messages
    .filter(
      message =>
        message.processing_status === "COMPLETED" &&
        typeof message.content === "string" &&
        message.content.trim(),
    )
    .map(message => {
      const role =
        message.role === "USER"
          ? "User"
          : "Assistant";

      return `${role}: ${message.content}`;
    })
    .join("\n");
}

function mapGeminiErrorCode(error) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : "";

  if (
    message.includes("timeout") ||
    message.includes("connect timeout")
  ) {
    return "GEMINI_TIMEOUT";
  }

  if (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand")
  ) {
    return "GEMINI_UNAVAILABLE";
  }

  return "GEMINI_ERROR";
}

async function processUserMessage({
  userInput,
  authenticatedUserId,
  conversationId = null,
  clientMessageId,
}) {
  if (!authenticatedUserId) {
    throw new Error(
      "Authenticated user ID is required.",
    );
  }

  if (
    typeof userInput !== "string" ||
    !userInput.trim()
  ) {
    throw new Error("Message is required.");
  }

  if (!clientMessageId) {
    throw new Error(
      "Client message ID is required.",
    );
  }

  const preparedTurn = await prepareChatTurn({
    conversationId,
    userId: authenticatedUserId,
    clientMessageId,
    message: userInput.trim(),
  });

  const {
    conversation,
    wasCreated,
    userMessage,
    assistantMessage,
  } = preparedTurn;

  try {
    const [
      historyResult,
      studentProfile,
      contextText,
    ] = await Promise.all([
      getConversationHistoryForPrompt(
        conversation.id,
        authenticatedUserId,
        12,
      ),

      getStudentProfile(
        authenticatedUserId,
      ),

      getRelevantContext(
        userInput.trim(),
      ),
    ]);

    /*
     * Remove the current PROCESSING assistant placeholder.
     * The current USER message remains in the prompt history.
     */
    const promptMessages =
      historyResult.messages.filter(
        message =>
          message.id !== assistantMessage.id,
      );

    const historyText =
      buildHistoryText(promptMessages);

    const profileForPrompt =
      studentProfile ?? {
        full_name: "",
        preferred_name: "",
        student_id: "",
        programme: "",
        faculty: "",
        current_year: null,
        current_trimester: null,
        academic_standing: "NORMAL",
        cgpa: null,
      };

    const prompt = buildPrompt(
      historyText,
      contextText,
      profileForPrompt,
      historyResult.conversation
        .conversation_summary ?? "",
    );

    const aiResponse =
      await getGeminiResponse(prompt);

    const completedAssistantMessage =
      await markMessageCompleted(
        assistantMessage.id,
        aiResponse,
      );

    let updatedConversation =
      await updateConversation(
        conversation.id,
        authenticatedUserId,
        {
          lastMessagePreview:
            createMessagePreview(aiResponse),
          lastMessageAt:
            new Date().toISOString(),
        },
      );

        if (
          wasCreated &&
          conversation.title_status === "PENDING"
        ) {
          try {
            const generatedTitle =
              await generateConversationTitle(
                userInput.trim(),
              );

            if (generatedTitle) {
              const titledConversation =
                await updateConversation(
                  conversation.id,
                  authenticatedUserId,
                  {
                    title: generatedTitle,
                    titleStatus: "GENERATED",
                  },
                );

              if (titledConversation) {
                updatedConversation =
                  titledConversation;
              }
            } else {
              const fallbackConversation =
                await updateConversation(
                  conversation.id,
                  authenticatedUserId,
                  {
                    titleStatus: "FALLBACK",
                  },
                );

              if (fallbackConversation) {
                updatedConversation =
                  fallbackConversation;
              }
            }
          } catch (titleError) {
            console.error(
              "Conversation title generation failed:",
              titleError,
            );

            const fallbackConversation =
              await updateConversation(
                conversation.id,
                authenticatedUserId,
                {
                  titleStatus: "FALLBACK",
                },
              );

            if (fallbackConversation) {
              updatedConversation =
                fallbackConversation;
            }
          }
        }
      updatedConversation =
      await updateConversationSummaryIfNeeded({
        conversation:
          updatedConversation ?? conversation,
        authenticatedUserId,
      });


    return {
      conversation:
        updatedConversation ?? conversation,

      wasCreated,

      userMessage,

      assistantMessage:
        completedAssistantMessage,
    };
  } catch (error) {
    const errorCode =
      mapGeminiErrorCode(error);

    await markMessageFailed(
      assistantMessage.id,
      errorCode,
    );

    console.error(
      "Chat processing failed:",
      error,
    );

    const chatError = new Error(
      error instanceof Error
        ? error.message
        : "Unable to process chat message.",
    );

    chatError.code = errorCode;
    chatError.conversationId =
      conversation.id;
    chatError.userMessageId =
      userMessage.id;
    chatError.assistantMessageId =
      assistantMessage.id;

    throw chatError;
  }
}

async function retryAssistantMessage({
  conversationId,
  assistantMessageId,
  authenticatedUserId,
}) {
  const conversation =
    await findConversationOwnedByUser(
      conversationId,
      authenticatedUserId,
    );

  if (!conversation) {
    const error = new Error(
      "Conversation not found or access denied.",
    );
    error.code = "CONVERSATION_NOT_FOUND";
    throw error;
  }

  const assistantMessage =
    await findMessageById(assistantMessageId);

  if (
    !assistantMessage ||
    assistantMessage.conversation_id !== conversationId ||
    assistantMessage.role !== "ASSISTANT" ||
    assistantMessage.processing_status !== "FAILED"
  ) {
    const error = new Error(
      "Failed assistant message not found.",
    );
    error.code = "FAILED_MESSAGE_NOT_FOUND";
    throw error;
  }

  const userMessage =
    await findPreviousUserMessage(
      conversationId,
      assistantMessage.created_at,
    );

  if (!userMessage) {
    throw new Error(
      "The original user message could not be found.",
    );
  }

  await updateMessage(assistantMessage.id, {
    content: "",
    processingStatus: "PROCESSING",
    errorCode: null,
  });

  try {
    const [
      messages,
      studentProfile,
      contextText,
    ] = await Promise.all([
      listRecentMessages(conversationId, 12),
      getStudentProfile(authenticatedUserId),
      getRelevantContext(userMessage.content),
    ]);

    const historyText = buildHistoryText(
      messages.filter(
        message => message.id !== assistantMessage.id,
      ),
    );

    const prompt = buildPrompt(
      historyText,
      contextText,
      studentProfile ?? {
        full_name: "",
        preferred_name: "",
        student_id: "",
        programme: "",
        faculty: "",
        current_year: null,
        current_trimester: null,
        academic_standing: "NORMAL",
        cgpa: null,
      },
    );

    const aiResponse =
      await getGeminiResponse(prompt);

    const completedMessage =
      await markMessageCompleted(
        assistantMessage.id,
        aiResponse,
      );

    await updateConversation(
      conversationId,
      authenticatedUserId,
      {
        lastMessagePreview:
          createMessagePreview(aiResponse),
        lastMessageAt: new Date().toISOString(),
      },
    );

    return completedMessage;
  } catch (error) {
    await markMessageFailed(
      assistantMessage.id,
      mapGeminiErrorCode(error),
    );

    throw error;
  }
}

async function updateConversationSummaryIfNeeded({
  conversation,
  authenticatedUserId,
}) {
  const messageCount =
    Number(conversation.message_count ?? 0);

  if (
    messageCount < 20 ||
    messageCount % 20 !== 0
  ) {
    return conversation;
  }

  try {
    const messages = await listMessages(
      conversation.id,
      {
        limit: 20,
        ascending: false,
      }
    );

    const chronologicalMessages =
      [...messages].reverse();

    const summary =
      await generateConversationSummary({
        existingSummary:
          conversation.conversation_summary ?? "",
        messages: chronologicalMessages,
      });

    if (!summary) {
      return conversation;
    }

    const updatedConversation =
      await updateConversation(
        conversation.id,
        authenticatedUserId,
        {
          conversationSummary: summary,
        }
      );

    return updatedConversation ?? conversation;
  } catch (error) {
    console.error(
      "Conversation summary update failed:",
      error
    );

    return conversation;
  }
}

export {
  buildHistoryText,
  processUserMessage,
  retryAssistantMessage,
};