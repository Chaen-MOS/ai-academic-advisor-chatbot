import { processUserMessage } from "../services/chatService.js";

async function handleChat(req, res) {
  try {
    const { studentId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const answer = await processUserMessage(message, studentId);

    res.json({
      answer,
    });
  } catch (error) {
    console.error("Chat API Error:", error.message);

    res.status(500).json({
      error: "Failed to process chat message",
    });
  }
}

export { handleChat };