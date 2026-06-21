import fs from "fs";

const HISTORY_FILE = "./data/chat-history.json";

function loadChatHistory() {
  try {
    const data = fs.readFileSync(HISTORY_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveChatHistory(conversationHistory) {
  fs.writeFileSync(
    HISTORY_FILE,
    JSON.stringify(conversationHistory, null, 2)
  );
}

export { loadChatHistory, saveChatHistory };