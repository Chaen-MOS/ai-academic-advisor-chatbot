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

  return searchKnowledgeChunks({
    queryEmbedding:
      questionEmbedding,

    userRole,

    matchThreshold:
      0.3,

    matchCount:
      topK,
  });

  return matches;
}