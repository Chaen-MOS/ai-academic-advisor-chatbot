import {supabaseAdmin} from "../config/supabaseAdmin.js";

async function insertKnowledgeChunks(
  chunks,
) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }

  const {data, error} = await supabaseAdmin
    .from("knowledge_chunks")
    .insert(chunks)
    .select("*");

  if (error) {
    throw new Error(
      `Failed to insert knowledge chunks: ${error.message}`,
    );
  }

  return data ?? [];
}

async function listChunksByDocumentId(
  documentId,
) {
  const {data, error} = await supabaseAdmin
    .from("knowledge_chunks")
    .select("*")
    .eq("document_id", documentId)
    .order("chunk_index", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load document chunks: ${error.message}`,
    );
  }

  return data ?? [];
}

async function deleteChunksByDocumentId(
  documentId,
) {
  const {error} = await supabaseAdmin
    .from("knowledge_chunks")
    .delete()
    .eq("document_id", documentId);

  if (error) {
    throw new Error(
      `Failed to delete document chunks: ${error.message}`,
    );
  }
}

async function searchKnowledgeChunks({
  queryEmbedding,
  matchThreshold = 0.5,
  matchCount = 5,
}) {
  const {data, error} =
    await supabaseAdmin.rpc(
      "match_knowledge_chunks",
      {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
      },
    );

  if (error) {
    throw new Error(
      `Failed to search knowledge chunks: ${error.message}`,
    );
  }

  return data ?? [];
}

export {
  deleteChunksByDocumentId,
  insertKnowledgeChunks,
  listChunksByDocumentId,
  searchKnowledgeChunks,
};