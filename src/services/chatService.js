import { getGeminiResponse } from "./geminiService.js";
import { loadChatHistory, saveChatHistory } from "../chat/conversationManager.js";
import buildPrompt from "../prompts/systemPrompt.js";

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

async function processUserMessage(userInput) {
  conversationHistory.push({
    role: "User",
    text: userInput,
  });

  saveChatHistory(conversationHistory);

  const historyText = buildHistoryText();
  const prompt = buildPrompt(historyText);

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