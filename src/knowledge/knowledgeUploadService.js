import {
  createKnowledgeDocument,
} from "./knowledgeDocumentRepository.js";
import {
  processKnowledgeDocument,
} from "./knowledgeProcessingService.js";
import {
  uploadKnowledgeFile,
} from "./knowledgeStorageService.js";

async function createUploadedKnowledgeDocument({
  file,
  title,
  category,
  description,
  uploadedBy,
  accessibleRoles,
}) {
  if (!file) {
    throw new Error(
      "PDF file is required.",
    );
  }

  const {
    storagePath,
  } =
    await uploadKnowledgeFile({
      fileBuffer:
        file.buffer,

      fileName:
        file.originalname,

      mimeType:
        file.mimetype,

      userId:
        uploadedBy,
    });

  const document =
  await createKnowledgeDocument({
    title:
      title?.trim() ||
      file.originalname,

    fileName:
      file.originalname,

    storagePath,

    mimeType:
      file.mimetype,

    category:
      category?.trim() ||
      null,

    description:
      description?.trim() ||
      null,

    uploadedBy,

    accessibleRoles:
      Array.isArray(accessibleRoles) &&
      accessibleRoles.length > 0
        ? accessibleRoles
        : [
            "STUDENT",
            "LECTURER",
            "ADMIN",
          ],
  });

    const processingResult =
    await processKnowledgeDocument({
        document,
        fileBuffer:
        file.buffer,
    });

    return processingResult;
    }

export {
  createUploadedKnowledgeDocument,
};