import {
  generateEmbedding,
} from "../services/embeddingService.js";

import {
  searchKnowledgeChunks,
} from "../knowledge/knowledgeChunkRepository.js";


export async function retrieveRelevantChunks(
  question,
  userRole,
  topK = 5,
) {
  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    return [];
  }

  const questionEmbedding =
    await generateEmbedding(
      question.trim(),
    );

  const chunks =
    await searchKnowledgeChunks({
      queryEmbedding:
        questionEmbedding,

      userRole,

      matchThreshold:
        0.3,

      matchCount:
        topK,
    });


  // RAG retrieval logging
  console.log(
    "\n========================================",
  );
  console.log(
    "RAG RETRIEVAL RESULT",
  );
  console.log(
    "========================================",
  );

  console.log(
    `Question: ${question.trim()}`,
  );

  console.log(
    `User Role: ${userRole}`,
  );

  console.log(
    `Retrieved Chunks: ${chunks.length}`,
  );


  chunks.forEach(
    (chunk, index) => {
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
        chunk.id ??
        index + 1;

      const similarity =
        typeof chunk.similarity ===
        "number"
          ? chunk.similarity.toFixed(4)
          : "N/A";

      const content =
        typeof chunk.content ===
        "string"
          ? chunk.content
              .replace(/\s+/g, " ")
              .slice(0, 350)
          : "Not available";

      console.log(
        `\nChunk ${index + 1}`,
      );

      console.log(
        `Chunk ID: ${chunkId}`,
      );

      console.log(
        `Database ID: ${
          chunk.id ?? "N/A"
        }`,
      );

      console.log(
        `Source: ${source}`,
      );

      console.log(
        `Similarity: ${similarity}`,
      );

      console.log(
        `Content: ${content}`,
      );
    },
  );


  console.log(
    "\n========================================\n",
  );

  return chunks;
}