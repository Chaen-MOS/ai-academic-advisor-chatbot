import "dotenv/config";
import fs from "fs";
import path from "path";
import { loadPdf } from "./pdfLoader.js";
import { chunkText } from "./chunker.js";
import { generateEmbedding } from "../services/embeddingService.js";

const DOCUMENTS_DIR = "./data/documents";
const OUTPUT_FILE = "./data/knowledgeBase.json";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function buildKnowledgeBase() {
  const files = fs
    .readdirSync(DOCUMENTS_DIR)
    .filter((file) => file.endsWith(".pdf"));

  const knowledgeBase = [];

  for (const file of files) {
    const filePath = path.join(DOCUMENTS_DIR, file);

    console.log(`Processing: ${file}`);

    const text = await loadPdf(filePath);
    const chunks = chunkText(text);

        for (const [index, chunk] of chunks.entries()) {
            console.log(
                `Embedding: ${file} | Chunk ${index + 1}/${chunks.length}`
            );

            const embedding = await generateEmbedding(chunk);

            knowledgeBase.push({
                source: file,
                chunkId: index + 1,
                text: chunk,
                embedding,
            });

            fs.writeFileSync(
                OUTPUT_FILE,
                JSON.stringify(knowledgeBase, null, 2)
            );

            await sleep(800);
            }
  }

  console.log(`Knowledge base created: ${OUTPUT_FILE}`);
  console.log(`Total chunks: ${knowledgeBase.length}`);
}

buildKnowledgeBase();