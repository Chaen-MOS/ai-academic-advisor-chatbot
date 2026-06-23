import { loadPdf } from "./rag/pdfLoader.js";

const text = await loadPdf("./data/documents/FAQ.pdf");

console.log(text.slice(0, 1000));