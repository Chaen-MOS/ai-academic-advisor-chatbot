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
import { getStudentProfile, updateAcademicData,  } from "../profiles/studentProfileService.js";
import { findConversationOwnedByUser, updateConversation,} from "../conversations/conversationRepository.js";
import { generateConversationSummary, } from "./conversationSummaryService.js";
import { getUserRole, } from "../roles/roleService.js";
import { classifyIntent, } from "../ai/intent/intentClassifier.js";
import { INTENTS, } from "../ai/intent/intentTypes.js";
import { buildTimetableContext, } from "../ai/context/timetableContext.js";
import { buildEventContext, } from "../ai/context/eventContext.js";
import { getMissingClarification, } from "../ai/clarification/clarificationEngine.js";
import { findMissingCgpaField, } from "../ai/clarification/cgpaClarification.js";
import { parseAcademicValue, } from "../ai/clarification/academicValueParser.js";
import { calculateHighestPossibleCgpa, } from "../ai/calculators/cgpaCalculator.js";
import { CGPA_ACTIONS, classifyCgpaAction, } from "../ai/calculators/cgpaActionClassifier.js";


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
    const userRole =
      await getUserRole(
        authenticatedUserId,
      );

      const intent =
        classifyIntent(
          userInput.trim(),
        );

      console.log(
        "DETECTED INTENT:",
        intent,
      );

      let timetableContext = "";
      let eventContext = "";

      if (
        intent === INTENTS.TIMETABLE ||
        intent === INTENTS.SCHEDULE
      ) {
        timetableContext =
          await buildTimetableContext(
            authenticatedUserId,
          );
      }

      if (
        intent === INTENTS.EVENT ||
        intent === INTENTS.SCHEDULE
      ) {
        eventContext =
          await buildEventContext(
            authenticatedUserId,
          );
      }

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
        userRole,
      ),
    ]);

    let workingProfile =
      studentProfile ?? {
        full_name: "",
        preferred_name: "",
        student_id: "",
        programme: "",
        faculty: "",
        current_year: null,
        current_trimester: null,
        academic_standing: null,
        cgpa: null,
        credits_earned: null,
        total_credits_required: null,
        academic_data_updated_at: null,
      };

    /*
    * If the previous assistant message asked for one
    * academic field, treat the current user message as
    * the answer to that field.
    */
    if (
      conversation.pending_intent ===
        INTENTS.CGPA &&
      conversation.pending_field
    ) {
      const pendingField =
        conversation.pending_field;

      const parsed =
        parseAcademicValue(
          pendingField,
          userInput.trim(),
        );

      /*
      * User did not provide a valid value.
      * Keep the pending state and ask again.
      */
      if (!parsed.valid) {
        let clarificationResponse;

        if (
          pendingField === "cgpa"
        ) {
          clarificationResponse =
            "Please enter a valid CGPA between 0.00 and 4.00.";
        } else {
          clarificationResponse =
            "Please enter a valid number of credit hours.";
        }

        const completedAssistantMessage =
          await markMessageCompleted(
            assistantMessage.id,
            clarificationResponse,
          );

        const updatedConversation =
          await updateConversation(
            conversation.id,
            authenticatedUserId,
            {
              lastMessagePreview:
                createMessagePreview(
                  clarificationResponse,
                ),
              lastMessageAt:
                new Date().toISOString(),
            },
          );

        return {
          conversation:
            updatedConversation ??
            conversation,

          wasCreated,

          userMessage,

          assistantMessage:
            completedAssistantMessage,
        };
      }

      /*
      * Convert database field name into the
      * camelCase structure expected by the
      * profile service.
      */
      const academicUpdate = {};

      if (
        pendingField === "cgpa"
      ) {
        academicUpdate.cgpa =
          parsed.value;
      }

      if (
        pendingField ===
        "credits_earned"
      ) {
        academicUpdate.creditsEarned =
          parsed.value;
      }

      if (
        pendingField ===
        "total_credits_required"
      ) {
        academicUpdate.totalCreditsRequired =
          parsed.value;
      }

      /*
      * Save the newly supplied academic value.
      */
      workingProfile =
        await updateAcademicData(
          authenticatedUserId,
          academicUpdate,
        );

      /*
      * The previous slot has now been answered.
      */
      await updateConversation(
        conversation.id,
        authenticatedUserId,
        {
          pendingIntent: null,
          pendingField: null,
        },
      );
    }

    /*
    * The user is either starting a CGPA request
    * or continuing an existing CGPA clarification.
    */
    const isCgpaFlow =
      intent === INTENTS.CGPA ||
      conversation.pending_intent ===
        INTENTS.CGPA;

    if (isCgpaFlow) {
      const missingField =
        findMissingCgpaField(
          workingProfile,
        );

      /*
      * There is still missing academic information.
      * Remember what we are waiting for, then ask.
      */
      if (missingField) {
        const updatedConversation =
          await updateConversation(
            conversation.id,
            authenticatedUserId,
            {
              pendingIntent:
                INTENTS.CGPA,

              pendingField:
                missingField.field,

              lastMessagePreview:
                createMessagePreview(
                  missingField.question,
                ),

              lastMessageAt:
                new Date().toISOString(),
            },
          );

        const completedAssistantMessage =
          await markMessageCompleted(
            assistantMessage.id,
            missingField.question,
          );

        return {
          conversation:
            updatedConversation ??
            conversation,

          wasCreated,

          userMessage,

          assistantMessage:
            completedAssistantMessage,
        };
      }

      /*
      * All required CGPA data is available.
      * Clear any leftover clarification state.
      */
      if (
        conversation.pending_intent ||
        conversation.pending_field
      ) {
        await updateConversation(
          conversation.id,
          authenticatedUserId,
          {
            pendingIntent: null,
            pendingField: null,
          },
        );
      }
    }

    let calculatorContext = "";

    if (
      intent === INTENTS.CGPA ||
      conversation.pending_intent ===
        INTENTS.CGPA
    ) {
      /*
      * The original CGPA question may be
      * earlier in the conversation if the
      * current message is only a clarification
      * answer such as "123".
      */
      const cgpaQuestion =
        conversation.pending_intent ===
          INTENTS.CGPA
          ? historyResult.messages
              .filter(
                message =>
                  message.role ===
                  "USER",
              )
              .map(
                message =>
                  message.content,
              )
              .find(
                content =>
                  classifyIntent(
                    content,
                  ) ===
                  INTENTS.CGPA,
              ) ?? userInput
          : userInput;

      const cgpaAction =
        classifyCgpaAction(
          cgpaQuestion,
        );

      console.log(
        "CGPA ACTION:",
        cgpaAction,
      );

      if (
        cgpaAction ===
        CGPA_ACTIONS.HIGHEST_POSSIBLE
      ) {
        const result =
          calculateHighestPossibleCgpa({
            currentCgpa:
              Number(
                workingProfile.cgpa,
              ),

            creditsEarned:
              Number(
                workingProfile
                  .credits_earned,
              ),

            totalCreditsRequired:
              Number(
                workingProfile
                  .total_credits_required,
              ),
          });
          if (result.alreadyAchieved) {
            calculatorContext = `
          CGPA CALCULATOR RESULT

          Current CGPA:
          ${workingProfile.cgpa}

          Target CGPA:
          ${targetCgpa}

          The student has already achieved the target CGPA.

          Important instructions:

          - Congratulate the student.
          - Do not mention a negative GPA.
          - Do not recalculate the result.
          - Do not use LaTeX.
          `;
          } else {
            calculatorContext = `
          CGPA CALCULATOR RESULT

          Calculation type:
          Required GPA For Target CGPA

          Current CGPA:
          ${workingProfile.cgpa}

          Target CGPA:
          ${targetCgpa}

          Credits earned:
          ${workingProfile.credits_earned}

          Remaining credits:
          ${result.remainingCredits}

          Required average GPA:
          ${result.requiredAverageGpa}

          Achievable:
          ${result.achievable ? "YES" : "NO"}

          Important instructions:

          - This result was calculated programmatically.
          - Treat this calculator result as the source of truth.
          - Do not recalculate the CGPA yourself.
          - Explain the result clearly.
          - Do not use LaTeX.
          `;
          }
      }
    }

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

    const isChatMemoryEnabled =
      studentProfile?.chat_memory_enabled !== false;

    const conversationSummary =
      isChatMemoryEnabled
        ? historyResult.conversation
            .conversation_summary ?? ""
        : "";

    const dynamicContext = [
      timetableContext,
      eventContext,
      calculatorContext,
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = buildPrompt(
      historyText,
      contextText,
      workingProfile,
      conversationSummary,
      dynamicContext,
      intent,
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
          chatMemoryEnabled:
            isChatMemoryEnabled,
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
    const userRole =
      await getUserRole(
        authenticatedUserId,
      );

    const [
      messages,
      studentProfile,
      contextText,
    ] = await Promise.all([
      listRecentMessages(
        conversationId,
        12,
      ),

      getStudentProfile(
        authenticatedUserId,
      ),

      getRelevantContext(
        userMessage.content,
        userRole,
      ),
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
  chatMemoryEnabled,
}) {
  if (!chatMemoryEnabled) {
    return conversation;
  }
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