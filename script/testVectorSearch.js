import "dotenv/config";

import {
  generateEmbedding,
} from "../src/services/embeddingService.js";

import {
  searchKnowledgeChunks,
} from "../src/knowledge/knowledgeChunkRepository.js";

const question =
  "How long is the Bachelor of Software Engineering programme?";

const queryEmbedding =
  await generateEmbedding(question);

console.log(
  "Query embedding dimension:",
  queryEmbedding.length,
);

const matches =
  await searchKnowledgeChunks({
    queryEmbedding,
    matchThreshold: 0.3,
    matchCount: 5,
  });

console.log(
  `Found ${matches.length} matches.\n`,
);

for (const match of matches) {
  console.log(
    "Similarity:",
    match.similarity,
  );

  console.log(
    "Content:",
    match.content.slice(0, 300),
  );

  console.log("-------------------");
}