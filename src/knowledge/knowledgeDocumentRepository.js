import {supabaseAdmin} from "../config/supabaseAdmin.js";

async function createKnowledgeDocument({
  title,
  fileName,
  storagePath,
  mimeType = "application/pdf",
  category = null,
  description = null,
  uploadedBy,
  accessibleRoles = [
    "STUDENT",
    "LECTURER",
    "ADMIN",
  ],
}) {
  const {data, error} = await supabaseAdmin
    .from("knowledge_documents")
    .insert({
      title,
      file_name: fileName,
      storage_path: storagePath,
      mime_type: mimeType,
      category,
      description,
      uploaded_by: uploadedBy,
      processing_status: "PENDING",
      is_enabled: true,
      accessible_roles: accessibleRoles,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create knowledge document: ${error.message}`,
    );
  }

  return data;
}

async function findKnowledgeDocumentById(
  documentId,
) {
  const {data, error} = await supabaseAdmin
    .from("knowledge_documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load knowledge document: ${error.message}`,
    );
  }

  return data;
}

async function listKnowledgeDocuments() {
  const {data, error} = await supabaseAdmin
    .from("knowledge_documents")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to list knowledge documents: ${error.message}`,
    );
  }

  return data ?? [];
}

async function updateKnowledgeDocument(
  documentId,
  updates,
) {
  const payload = {
    title: updates.title,
    category: updates.category,
    description: updates.description,
    processing_status:
      updates.processingStatus,
    processing_error:
      updates.processingError,
    is_enabled:
      updates.isEnabled,
    version:
      updates.version,
    updated_at:
      new Date().toISOString(),
  };

  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  const {data, error} = await supabaseAdmin
    .from("knowledge_documents")
    .update(payload)
    .eq("id", documentId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to update knowledge document: ${error.message}`,
    );
  }

  return data;
}

async function deleteKnowledgeDocument(
  documentId,
) {
  const {data, error} = await supabaseAdmin
    .from("knowledge_documents")
    .delete()
    .eq("id", documentId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to delete knowledge document: ${error.message}`,
    );
  }

  return data;
}



export {
  createKnowledgeDocument,
  deleteKnowledgeDocument,
  findKnowledgeDocumentById,
  listKnowledgeDocuments,
  updateKnowledgeDocument,
};