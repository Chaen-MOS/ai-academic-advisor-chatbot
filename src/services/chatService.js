import { getGeminiResponse } from "./geminiService.js";
import buildPrompt from "../prompts/systemPrompt.js";
import { getRelevantContext } from "./ragService.js";

import {
  prepareChatTurn,
  getConversationHistoryForPrompt,
  createMessagePreview,
} from "../conversations/conversationService.js";

import {
  markMessageCompleted,
  markMessageFailed,
} from "../messages/messageRepository.js";

import {
  getStudentProfile,
} from "../profiles/studentProfileService.js";

import {
  updateConversation,
} from "../conversations/conversationRepository.js";

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
    );

    const aiResponse =
      await getGeminiResponse(prompt);

    const completedAssistantMessage =
      await markMessageCompleted(
        assistantMessage.id,
        aiResponse,
      );

    const updatedConversation =
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

export {
  buildHistoryText,
  processUserMessage,
};