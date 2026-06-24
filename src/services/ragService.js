import fs from "fs";
import { retrieveRelevantChunks } from "../rag/retriever.js";

const KNOWLEDGE_BASE_FILE = "./data/knowledgeBase.json";

function loadKnowledgeBase() {
  try {
    const data = fs.readFileSync(KNOWLEDGE_BASE_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.log("Warning: knowledgeBase.json not found or invalid.");
    return [];
  }
}

async function getRelevantContext(question) {
  const knowledgeBase = loadKnowledgeBase();

  const relevantChunks = await retrieveRelevantChunks(
    question,
    knowledgeBase,
    3
    );

  if (relevantChunks.length === 0) {
    return "";
  }

  return relevantChunks
    .map((chunk) => {
      return `
Source: ${chunk.source}
Chunk ID: ${chunk.chunkId}
Content:
${chunk.text}
`;
    })
    .join("\n---\n");
}

export { getRelevantContext };