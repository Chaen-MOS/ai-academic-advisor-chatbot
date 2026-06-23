import readline from "readline";
import { processUserMessage } from "./services/chatService.js";
import { loadPdf } from "./rag/pdfLoader.js";

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
      const aiResponse = await processUserMessage(userInput);
      console.log("\nAI:", aiResponse, "\n");
    } catch (error) {
      console.log("Error:", error.message);
    }

    askQuestion();
  });
}

askQuestion();