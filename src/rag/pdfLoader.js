import {createRequire} from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

async function loadPdfFromBuffer(fileBuffer) {
  if (!fileBuffer) {
    throw new Error("PDF buffer is required.");
  }

  const data = await pdf(fileBuffer);

  return {
    text: data.text ?? "",
    pageCount: data.numpages ?? null,
    info: data.info ?? null,
  };
}

export {
  loadPdfFromBuffer,
};