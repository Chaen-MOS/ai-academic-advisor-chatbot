import {
  insertKnowledgeChunks,
} from "./knowledgeChunkRepository.js";

import {
  updateKnowledgeDocument,
} from "./knowledgeDocumentRepository.js";

import {
  loadPdfFromBuffer,
} from "../rag/pdfLoader.js";

import {
  chunkText,
} from "../rag/chunker.js";

import {
  generateEmbedding,
} from "../services/embeddingService.js";

async function processKnowledgeDocument({
  document,
  fileBuffer,
}) {
  try {
    await updateKnowledgeDocument(
      document.id,
      {
        processingStatus:
          "PROCESSING",

        processingError: null,
      },
    );

    const pdfResult =
      await loadPdfFromBuffer(
        fileBuffer,
      );

    const extractedChunks =
      chunkText(
        pdfResult.text,
        800,
        100,
      );

    if (extractedChunks.length === 0) {
      throw new Error(
        "No readable text was extracted from the PDF.",
      );
    }

    const chunkRows = [];

    for (const chunk of extractedChunks) {
    const embedding =
        await generateEmbedding(
        chunk.content,
        );

    chunkRows.push({
        document_id:
        document.id,

        chunk_index:
        chunk.chunkIndex,

        content:
        chunk.content,

        embedding,

        page_number:
        null,

        token_count:
        null,

        metadata: {
        documentTitle:
            document.title,

        category:
            document.category,

        fileName:
            document.file_name,

        pageCount:
            pdfResult.pageCount,
        },
    });
    }

    await insertKnowledgeChunks(
      chunkRows,
    );

    const readyDocument =
      await updateKnowledgeDocument(
        document.id,
        {
          processingStatus:
            "READY",

          processingError: null,
        },
      );

    return {
      document:
        readyDocument,

      chunkCount:
        chunkRows.length,
    };
  } catch (error) {
    await updateKnowledgeDocument(
      document.id,
      {
        processingStatus:
          "FAILED",

        processingError:
          error instanceof Error
            ? error.message
            : "Unknown processing error.",
      },
    );

    throw error;
  }
}

export {
  processKnowledgeDocument,
};