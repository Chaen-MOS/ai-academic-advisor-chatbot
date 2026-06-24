import { generateEmbedding } from "../services/embeddingService.js";

function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ");
}

function extractKeywords(question) {
  const stopWords = [
    "what", "how", "when", "where", "why", "can", "i", "do", "does",
    "is", "are", "the", "a", "an", "to", "for", "of", "in", "on",
    "and", "or", "with", "my", "me"
  ];

  return normalizeText(question)
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter((word) => !stopWords.includes(word));
}

function scoreChunk(chunkText, keywords) {
  const normalizedChunk = normalizeText(chunkText);
  let score = 0;

  for (const keyword of keywords) {
    if (normalizedChunk.includes(keyword)) {
      score++;
    }
  }

  return score;
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

export async function retrieveRelevantChunks(question, knowledgeBase, topK = 5) {
  const questionEmbedding = await generateEmbedding(question);

  return knowledgeBase
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}