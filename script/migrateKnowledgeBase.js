import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {fileURLToPath} from "node:url";

import {supabaseAdmin} from "../src/config/supabaseAdmin.js";

import {
  createKnowledgeDocument,
  updateKnowledgeDocument,
} from "../src/knowledge/knowledgeDocumentRepository.js";

import {
  insertKnowledgeChunks,
  searchKnowledgeChunks,
} from "../src/knowledge/knowledgeChunkRepository.js";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const projectRoot =
  path.resolve(__dirname, "..");

const knowledgeBasePath =
  path.join(
    projectRoot,
    "knowledgeBase.json",
  );

const documentsDirectory =
  path.join(
    projectRoot,
    "data",
    "documents",
  );

const KNOWLEDGE_BUCKET =
  "knowledge-documents";

const adminUserId =
  process.env.MIGRATION_ADMIN_USER_ID;

if (!adminUserId) {
  throw new Error(
    "MIGRATION_ADMIN_USER_ID is required.",
  );
}

function sanitizeFileName(fileName) {
  return fileName
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "_",
    )
    .replace(/_+/g, "_");
}

async function uploadPdf(
  sourceFileName,
) {
  const localPath =
    path.join(
      documentsDirectory,
      sourceFileName,
    );

  if (!fs.existsSync(localPath)) {
    throw new Error(
      `PDF not found: ${localPath}`,
    );
  }

  const fileBuffer =
    fs.readFileSync(localPath);

  const safeFileName =
    sanitizeFileName(
      sourceFileName,
    );

  const storagePath =
    `${adminUserId}/migration/${randomUUID()}-${safeFileName}`;

  const {data, error} =
    await supabaseAdmin.storage
      .from(KNOWLEDGE_BUCKET)
      .upload(
        storagePath,
        fileBuffer,
        {
          contentType:
            "application/pdf",

          upsert: false,
        },
      );

  if (error) {
    throw new Error(
      `Failed to upload ${sourceFileName}: ${error.message}`,
    );
  }

  return data.path;
}

async function migrate() {
  const knowledgeBase =
    JSON.parse(
      fs.readFileSync(
        knowledgeBasePath,
        "utf8",
      ),
    );

  console.log(
    `Loaded ${knowledgeBase.length} legacy chunks.`,
  );

  if (
    !Array.isArray(
      knowledgeBase[0]?.embedding,
    )
  ) {
    throw new Error(
      "Legacy knowledge base does not contain embeddings.",
    );
  }

  console.log(
    "Embedding dimension:",
    knowledgeBase[0]
      .embedding.length,
  );

  const groupedBySource =
    new Map();

  for (const item of knowledgeBase) {
    const source =
      item.source?.trim();

    if (!source) {
      console.warn(
        "Skipping chunk without source:",
        item.chunkId,
      );

      continue;
    }

    if (
      !groupedBySource.has(source)
    ) {
      groupedBySource.set(
        source,
        [],
      );
    }

    groupedBySource
      .get(source)
      .push(item);
  }

  console.log(
    `Found ${groupedBySource.size} documents.`,
  );

  for (
    const [
      source,
      legacyChunks,
    ] of groupedBySource
  ) {
    console.log(
      `\nMigrating ${source}`,
    );

    console.log(
      `Chunks: ${legacyChunks.length}`,
    );

    try {
      const storagePath =
        await uploadPdf(source);

      console.log(
        `Uploaded PDF: ${storagePath}`,
      );

      const document =
        await createKnowledgeDocument({
          title:
            source.replace(
              /\.pdf$/i,
              "",
            ),

          fileName:
            source,

          storagePath,

          mimeType:
            "application/pdf",

          category:
            "MIGRATED",

          description:
            "Migrated from legacy knowledge base.",

          uploadedBy:
            adminUserId,
        });

      await updateKnowledgeDocument(
        document.id,
        {
          processingStatus:
            "PROCESSING",

          processingError:
            null,
        },
      );

      const chunkRows =
        legacyChunks.map(
          (item, index) => ({
            document_id:
              document.id,

            chunk_index:
              Number.isInteger(
                item.chunkId,
              )
                ? item.chunkId
                : index,

            content:
              item.text,

            embedding:
              item.embedding,

            page_number:
              item.pageNumber ??
              item.page_number ??
              null,

            token_count:
              null,

            metadata: {
              migrated:
                true,

              legacySource:
                source,

              legacyChunkId:
                item.chunkId ??
                null,
            },
          }),
        );

      await insertKnowledgeChunks(
        chunkRows,
      );

      await updateKnowledgeDocument(
        document.id,
        {
          processingStatus:
            "READY",

          processingError:
            null,
        },
      );

      console.log(
        `READY: ${source}`,
      );
    } catch (error) {
      console.error(
        `FAILED: ${source}`,
      );

      console.error(
        error instanceof Error
          ? error.message
          : error,
      );
    }
  }

  console.log(
    "\nMigration finished.",
  );
}

await migrate();