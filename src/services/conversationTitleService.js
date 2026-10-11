import { getGeminiResponse } from "./geminiService.js";

function cleanGeneratedTitle(rawTitle) {
  if (typeof rawTitle !== "string") {
    return null;
  }

  const cleanedTitle = rawTitle
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!?。！？]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedTitle) {
    return null;
  }

  const words = cleanedTitle.split(" ");

  if (words.length > 7) {
    return words.slice(0, 7).join(" ");
  }

  return cleanedTitle;
}

async function generateConversationTitle(firstMessage) {
  if (
    typeof firstMessage !== "string" ||
    !firstMessage.trim()
  ) {
    return null;
  }

  const prompt = `
Generate a short title for the following academic advising conversation.

Rules:
- Use 3 to 7 words.
- Do not use quotation marks.
- Do not add ending punctuation.
- Accurately summarize the user's main topic.
- Do not write "Conversation about".
- Return only the title.

User message:
${firstMessage.trim()}
`;

  const generatedTitle =
    await getGeminiResponse(prompt);

  return cleanGeneratedTitle(generatedTitle);
}

export {
  cleanGeneratedTitle,
  generateConversationTitle,
};