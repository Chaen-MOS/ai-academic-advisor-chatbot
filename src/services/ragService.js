import {
  retrieveRelevantChunks,
} from "../rag/retriever.js";

async function getRelevantContext(
  question,
  userRole,
) {
  const relevantChunks =
    await retrieveRelevantChunks(
      question,
      userRole,
      3,
    );

  if (
    !Array.isArray(
      relevantChunks,
    ) ||
    relevantChunks.length === 0
  ) {
    return "";
  }

  return relevantChunks
    .map((chunk, index) => {
      const source =
        chunk.metadata
          ?.legacySource ??
        chunk.metadata
          ?.fileName ??
        chunk.metadata
          ?.documentTitle ??
        "Knowledge Base";

      const chunkId =
        chunk.metadata
          ?.legacyChunkId ??
        index + 1;

      return `
Source: ${source}
Chunk ID: ${chunkId}
Similarity: ${
        typeof chunk.similarity ===
        "number"
          ? chunk.similarity.toFixed(4)
          : "N/A"
      }
Content:
${chunk.content}
`.trim();
    })
    .join("\n---\n");
}

export {
  getRelevantContext,
};