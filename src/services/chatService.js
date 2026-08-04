import { getGeminiResponse } from "./geminiService.js";
import {
  loadChatHistory,
  saveChatHistory,
} from "../chat/conversationManager.js";
import buildPrompt from "../prompts/systemPrompt.js";
import { getRelevantContext } from "./ragService.js";
import { getStudentProfile } from "../profiles/studentProfileService.js";

const conversationHistory = loadChatHistory();

function buildHistoryText() {
  return conversationHistory
    .map((message) => `${message.role}: ${message.text}`)
    .join("\n");
}

function trimConversationHistory() {
  while (conversationHistory.length > 10) {
    conversationHistory.shift();
  }
}

async function processUserMessage(
  userInput,
  authenticatedUserId,
) {
  if (!authenticatedUserId) {
    throw new Error("Authenticated user ID is required.");
  }

  const storedProfile =
    await getStudentProfile(authenticatedUserId);

  const studentProfile = storedProfile ?? {
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

  conversationHistory.push({
    role: "User",
    text: userInput,
  });

  saveChatHistory(conversationHistory);

  const historyText = buildHistoryText();
  const contextText = await getRelevantContext(userInput);

  const prompt = buildPrompt(
    historyText,
    contextText,
    studentProfile,
  );

  const aiResponse = await getGeminiResponse(prompt);

  conversationHistory.push({
    role: "AI",
    text: aiResponse,
  });

  trimConversationHistory();
  saveChatHistory(conversationHistory);

  return aiResponse;
}

export { processUserMessage };