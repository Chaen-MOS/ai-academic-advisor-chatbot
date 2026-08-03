import { processUserMessage } from "../services/chatService.js";

async function handleChat(req, res) {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
        code: "MESSAGE_REQUIRED",
      });
    }

    const answer = await processUserMessage(
      message.trim(),
      userId
    );

    return res.json({
      answer,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    return res.status(500).json({
      error: "Failed to process chat message.",
      code: "CHAT_PROCESSING_FAILED",
    });
  }
}

export { handleChat };