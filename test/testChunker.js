import { loadPdf } from "../src/rag/pdfLoader.js";
import { chunkText } from "../src/rag/chunker.js";

const text = await loadPdf("./data/documents/FAQ.pdf");

const chunks = chunkText(text);

console.log("Total chunks:", chunks.length);
console.log("First chunk:");
console.log(chunks[0]);