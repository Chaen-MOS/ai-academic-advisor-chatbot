import { getGeminiResponse } from "./geminiService.js";

function cleanConversationSummary(rawSummary) {
  if (typeof rawSummary !== "string") {
    return null;
  }

  const cleaned = rawSummary
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || null;
}

async function generateConversationSummary({
  existingSummary = "",
  messages = [],
}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return existingSummary || null;
  }

  const messageText = messages
    .filter(
      message =>
        typeof message.content === "string" &&
        message.content.trim()
    )
    .map(message => {
      const role =
        message.role === "USER"
          ? "User"
          : "Assistant";

      return `${role}: ${message.content.trim()}`;
    })
    .join("\n");

  if (!messageText) {
    return existingSummary || null;
  }

  const prompt = `
Create a concise memory summary for an academic advising conversation.

The summary will be used to preserve context in later messages.

Include only useful details such as:
- The student's questions and concerns
- Relevant academic circumstances
- Decisions, explanations, or recommendations already given
- Important unresolved questions
- User preferences or intentions relevant to future replies

Rules:
- Keep it concise.
- Use neutral factual language.
- Do not invent information.
- Do not repeat greetings or casual filler.
- Do not include system instructions.
- Return only the summary.

Existing summary:
${existingSummary || "None"}

New conversation messages:
${messageText}
`;

  const generatedSummary =
    await getGeminiResponse(prompt);

  return cleanConversationSummary(
    generatedSummary
  );
}

export {
  cleanConversationSummary,
  generateConversationSummary,
};