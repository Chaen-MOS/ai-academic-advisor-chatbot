import {
  deleteKnowledgeDocument,
  findKnowledgeDocumentById,
  listKnowledgeDocuments,
  updateKnowledgeDocument,
} from "./knowledgeDocumentRepository.js";
import {
  deleteKnowledgeFile,
} from "./knowledgeStorageService.js";
import {
  listChunksByDocumentId,
} from "./knowledgeChunkRepository.js";

const VALID_ACCESS_ROLES = [
  "STUDENT",
  "LECTURER",
  "ADMIN",
];

async function getKnowledgeDocuments() {
  return listKnowledgeDocuments();
}

async function setKnowledgeDocumentAccess(
  documentId,
  accessibleRoles,
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

  if (
    !Array.isArray(
      accessibleRoles,
    ) ||
    accessibleRoles.length === 0
  ) {
    const error = new Error(
      "At least one accessible role is required.",
    );

    error.code =
      "INVALID_ACCESSIBLE_ROLES";

    throw error;
  }

  const normalizedRoles = [
    ...new Set(
      accessibleRoles.map(role =>
        typeof role === "string"
          ? role
              .trim()
              .toUpperCase()
          : "",
      ),
    ),
  ];

  const hasInvalidRole =
    normalizedRoles.some(
      role =>
        !VALID_ACCESS_ROLES.includes(
          role,
        ),
    );

  if (hasInvalidRole) {
    const error = new Error(
      "Invalid accessible role.",
    );

    error.code =
      "INVALID_ACCESSIBLE_ROLES";

    throw error;
  }

  return updateKnowledgeDocument(
    documentId,
    {
      accessibleRoles:
        normalizedRoles,
    },
  );
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

  /*
   * Delete the PDF from Supabase Storage first.
   *
   * If Storage deletion fails, keep the database row
   * so we do not lose the reference to an orphaned file.
   */
  if (document.storage_path) {
    await deleteKnowledgeFile(
      document.storage_path,
    );
  }

  /*
   * Deleting knowledge_documents will automatically
   * delete its knowledge_chunks because document_id
   * uses ON DELETE CASCADE.
   */
  const deletedDocument =
    await deleteKnowledgeDocument(
      documentId,
    );

  return deletedDocument;
}

export {
  getKnowledgeDocument,
  getKnowledgeDocuments,
  removeKnowledgeDocument,
  setKnowledgeDocumentEnabled,
  setKnowledgeDocumentAccess,
};