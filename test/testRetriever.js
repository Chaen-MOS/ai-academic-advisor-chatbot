import { loadPdf } from "../src/rag/pdfLoader.js";
import { chunkText } from "../src/rag/chunker.js";
import { retrieveRelevantChunks } from "../src/rag/retriever.js";

const text = await loadPdf("./data/documents/FAQ.pdf");
const chunks = chunkText(text);

const question = "How many credit hours can I register?";

const results = retrieveRelevantChunks(question, chunks);

console.log("Relevant chunks:");
console.log(results);