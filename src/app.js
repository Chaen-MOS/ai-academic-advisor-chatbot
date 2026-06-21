import readline from "readline";
import { getGeminiResponse } from "./services/geminiService.js";
import { loadChatHistory, saveChatHistory } from "./chat/conversationManager.js";
import buildPrompt from "./prompts/systemPrompt.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const conversationHistory = loadChatHistory();

console.log("==============================");
console.log(" AI Academic Advisor Chatbot");
console.log("==============================");
console.log("Type your question below.");
console.log("Type 'exit' to quit.\n");

function askQuestion() {
  rl.question("You: ", async (userInput) => {
    if (userInput.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    conversationHistory.push({
      role: "User",
      text: userInput,
    });

    saveChatHistory(conversationHistory);

    const historyText = conversationHistory
      .map((message) => `${message.role}: ${message.text}`)
      .join("\n");

    const prompt = buildPrompt(historyText);

    try {
      const aiResponse = await getGeminiResponse(prompt);

      console.log("\nAI:", aiResponse, "\n");

      conversationHistory.push({
        role: "AI",
        text: aiResponse,
      });

    while (conversationHistory.length > 10) {
        conversationHistory.shift();
    }

      saveChatHistory(conversationHistory);
    } catch (error) {
      console.log("Error:", error.message);
    }

    askQuestion();
  });
}

askQuestion();