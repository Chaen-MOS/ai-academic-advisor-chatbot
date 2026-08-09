import {
  getKnowledgeDocument,
  getKnowledgeDocuments,
  removeKnowledgeDocument,
  setKnowledgeDocumentEnabled,
} from "../knowledge/knowledgeService.js";
import {
  createUploadedKnowledgeDocument,
} from "../knowledge/knowledgeUploadService.js";

async function handleListKnowledgeDocuments(
  req,
  res,
) {
  try {
    const documents =
      await getKnowledgeDocuments();

    return res.json({
      documents,
    });
  } catch (error) {
    console.error(
      "List Knowledge Documents Error:",
      error,
    );

    return res.status(500).json({
      error:
        "Failed to load knowledge documents.",
      code:
        "KNOWLEDGE_LIST_FAILED",
    });
  }
}

async function handleGetKnowledgeDocument(
  req,
  res,
) {
  try {
    const result =
      await getKnowledgeDocument(
        req.params.documentId,
      );

    return res.json(result);
  } catch (error) {
    const status =
      error.code ===
      "KNOWLEDGE_DOCUMENT_NOT_FOUND"
        ? 404
        : 500;

    return res.status(status).json({
      error:
        error.message ??
        "Failed to load knowledge document.",
      code:
        error.code ??
        "KNOWLEDGE_LOAD_FAILED",
    });
  }
}

async function handleSetKnowledgeEnabled(
  req,
  res,
) {
  try {
    const document =
      await setKnowledgeDocumentEnabled(
        req.params.documentId,
        req.body.isEnabled,
      );

    return res.json({
      document,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ??
        "Failed to update knowledge document.",
      code:
        error.code ??
        "KNOWLEDGE_UPDATE_FAILED",
    });
  }
}

async function handleDeleteKnowledgeDocument(
  req,
  res,
) {
  try {
    const document =
      await removeKnowledgeDocument(
        req.params.documentId,
      );

    return res.json({
      success: true,
      documentId:
        document.id,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ??
        "Failed to delete knowledge document.",
      code:
        error.code ??
        "KNOWLEDGE_DELETE_FAILED",
    });
  }
}

async function handleUploadKnowledgeDocument(
  req,
  res,
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error:
          "PDF file is required.",
        code:
          "KNOWLEDGE_FILE_REQUIRED",
      });
    }

    const result =
        await createUploadedKnowledgeDocument({
            file:
            req.file,

            title:
            req.body.title,

            category:
            req.body.category,

            description:
            req.body.description,

            uploadedBy:
            req.user.id,
        });

        return res.status(201).json({
        document:
            result.document,

        chunkCount:
            result.chunkCount,
        });
  } catch (error) {
    console.error(
      "Upload Knowledge Error:",
      error,
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload knowledge document.",

      code:
        "KNOWLEDGE_UPLOAD_FAILED",
    });
  }
}

export {
  handleDeleteKnowledgeDocument,
  handleGetKnowledgeDocument,
  handleListKnowledgeDocuments,
  handleSetKnowledgeEnabled,
  handleUploadKnowledgeDocument,
};