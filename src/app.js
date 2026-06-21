import 'dotenv/config';
import readline from 'readline';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are an AI Academic Advisor Chatbot.
Answer student academic questions clearly and carefully.
If the answer requires official confirmation, remind the student to check with the faculty or academic advisor.

Student question:
${userInput}
        `,
      });

      console.log("\nAI:", response.text, "\n");
    } catch (error) {
      console.log("Error:", error.message);
    }

    askQuestion();
  });
}

askQuestion();