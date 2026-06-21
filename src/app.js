import 'dotenv/config';
import readline from 'readline';
import { GoogleGenAI } from '@google/genai';
import fs from "fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const HISTORY_FILE = "./data/chat-history.json";

const conversationHistory = loadChatHistory();

console.log("==============================");
console.log(" AI Academic Advisor Chatbot");
console.log("==============================");
console.log("Type your question below.");
console.log("Type 'exit' to quit.\n");

function loadChatHistory() {
  try {
    const data = fs.readFileSync(HISTORY_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveChatHistory() {
  fs.writeFileSync(
    HISTORY_FILE,
    JSON.stringify(conversationHistory, null, 2)
  );
}

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

    saveChatHistory();

    const historyText = conversationHistory
      .map((message) => `${message.role}: ${message.text}`)
      .join("\n");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are an UTAR Academic Advisor.
Answer student academic questions clearly and carefully.
Keep your answer around 3 to 5 bullet points.
If the answer requires official confirmation, remind the student to check with the faculty or academic advisor.

Conversation history:
${historyText}
        `,
      });

      console.log("\nAI:", response.text, "\n");

      conversationHistory.push({
        role: "AI",
        text: response.text,
      });

      saveChatHistory();

      if (conversationHistory.length > 10) {
        conversationHistory.shift();
      }
    } catch (error) {
      console.log("Error:", error.message);
    }

    askQuestion();
  });
}

askQuestion();