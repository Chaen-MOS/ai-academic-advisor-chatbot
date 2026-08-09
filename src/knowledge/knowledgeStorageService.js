import {randomUUID} from "node:crypto";

import {supabaseAdmin} from "../config/supabaseAdmin.js";

const KNOWLEDGE_BUCKET =
  "knowledge-documents";

function sanitizeFileName(fileName) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

async function uploadKnowledgeFile({
  fileBuffer,
  fileName,
  mimeType,
  userId,
}) {
  const safeFileName =
    sanitizeFileName(fileName);

  const storagePath =
    `${userId}/${randomUUID()}-${safeFileName}`;

  const {data, error} =
    await supabaseAdmin.storage
      .from(KNOWLEDGE_BUCKET)
      .upload(
        storagePath,
        fileBuffer,
        {
          contentType: mimeType,
          upsert: false,
        },
      );

  if (error) {
    throw new Error(
      `Failed to upload knowledge file: ${error.message}`,
    );
  }

  return {
    storagePath: data.path,
  };
}

async function deleteKnowledgeFile(
  storagePath,
) {
  const {error} =
    await supabaseAdmin.storage
      .from(KNOWLEDGE_BUCKET)
      .remove([storagePath]);

  if (error) {
    throw new Error(
      `Failed to delete knowledge file: ${error.message}`,
    );
  }
}

export {
  deleteKnowledgeFile,
  uploadKnowledgeFile,
};