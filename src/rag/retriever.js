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

function retrieveRelevantChunks(question, knowledgeBase, topK = 3) {
  const keywords = extractKeywords(question);

  return knowledgeBase
    .map((item) => ({
      source: item.source,
      chunkId: item.chunkId,
      text: item.text,
      score: scoreChunk(item.text, keywords),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export { retrieveRelevantChunks };