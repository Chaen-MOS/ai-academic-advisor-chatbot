import {
  generateEmbedding,
} from "../services/embeddingService.js";

import {
  searchKnowledgeChunks,
} from "../knowledge/knowledgeChunkRepository.js";

export async function retrieveRelevantChunks(
  question,
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

  const matches =
    await searchKnowledgeChunks({
      queryEmbedding:
        questionEmbedding,

      matchThreshold:
        0.3,

      matchCount:
        topK,
    });

  return matches;
}