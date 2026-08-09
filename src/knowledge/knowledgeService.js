import {
  deleteKnowledgeDocument,
  findKnowledgeDocumentById,
  listKnowledgeDocuments,
  updateKnowledgeDocument,
} from "./knowledgeDocumentRepository.js";

import {
  listChunksByDocumentId,
} from "./knowledgeChunkRepository.js";

async function getKnowledgeDocuments() {
  return listKnowledgeDocuments();
}

async function getKnowledgeDocument(
  documentId,
) {
  const document =
    await findKnowledgeDocumentById(
      documentId,
    );

  if (!document) {
    const error = new Error(
      "Knowledge document not found.",
    );

    error.code =
      "KNOWLEDGE_DOCUMENT_NOT_FOUND";

    throw error;
  }

  const chunks =
    await listChunksByDocumentId(
      documentId,
    );

  return {
    document,
    chunks,
  };
}

async function setKnowledgeDocumentEnabled(
  documentId,
  isEnabled,
) {
  const document =
    await findKnowledgeDocumentById(
      documentId,
    );

  if (!document) {
    const error = new Error(
      "Knowledge document not found.",
    );

    error.code =
      "KNOWLEDGE_DOCUMENT_NOT_FOUND";

    throw error;
  }

  return updateKnowledgeDocument(
    documentId,
    {
      isEnabled:
        Boolean(isEnabled),
    },
  );
}

async function removeKnowledgeDocument(
  documentId,
) {
  const document =
    await findKnowledgeDocumentById(
      documentId,
    );

  if (!document) {
    const error = new Error(
      "Knowledge document not found.",
    );

    error.code =
      "KNOWLEDGE_DOCUMENT_NOT_FOUND";

    throw error;
  }

  return deleteKnowledgeDocument(
    documentId,
  );
}

export {
  getKnowledgeDocument,
  getKnowledgeDocuments,
  removeKnowledgeDocument,
  setKnowledgeDocumentEnabled,
};