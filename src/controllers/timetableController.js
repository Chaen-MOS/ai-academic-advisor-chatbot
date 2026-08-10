import {
  editTimetableEntry,
  getUserTimetable,
  previewTimetableImport,
  removeTimetableEntry,
  saveImportedTimetable,
} from "../timetable/timetableService.js";

async function handlePreviewTimetable(
  req,
  res,
) {
  try {
    const {rawText} = req.body;

    if (
      typeof rawText !== "string" ||
      !rawText.trim()
    ) {
      return res.status(400).json({
        error:
          "Timetable text is required.",
        code:
          "TIMETABLE_TEXT_REQUIRED",
      });
    }

    const entries =
      await previewTimetableImport(
        rawText,
      );

    return res.json({
      entries,
      entryCount: entries.length,
    });
  } catch (error) {
    console.error(
      "Preview Timetable Error:",
      error,
    );

    const status =
      error.code ===
      "TIMETABLE_PARSE_FAILED"
        ? 400
        : 500;

    return res.status(status).json({
      error:
        error.message ??
        "Failed to parse timetable.",

      code:
        error.code ??
        "TIMETABLE_PREVIEW_FAILED",
    });
  }
}

async function handleImportTimetable(
  req,
  res,
) {
  try {
    const {entries} = req.body;

    const savedEntries =
      await saveImportedTimetable(
        req.user.id,
        entries,
      );

    return res.status(201).json({
      entries: savedEntries,
      entryCount:
        savedEntries.length,
    });
  } catch (error) {
    console.error(
      "Import Timetable Error:",
      error,
    );

    const status =
      error.code ===
      "TIMETABLE_ENTRIES_REQUIRED"
        ? 400
        : 500;

    return res.status(status).json({
      error:
        error.message ??
        "Failed to import timetable.",

      code:
        error.code ??
        "TIMETABLE_IMPORT_FAILED",
    });
  }
}

async function handleGetTimetable(
  req,
  res,
) {
  try {
    const entries =
      await getUserTimetable(
        req.user.id,
      );

    return res.json({
      entries,
    });
  } catch (error) {
    console.error(
      "Get Timetable Error:",
      error,
    );

    return res.status(500).json({
      error:
        error.message ??
        "Failed to load timetable.",

      code:
        "TIMETABLE_LOAD_FAILED",
    });
  }
}

async function handleUpdateTimetableEntry(
  req,
  res,
) {
  try {
    const entry =
      await editTimetableEntry(
        req.user.id,
        req.params.entryId,
        req.body,
      );

    return res.json({
      entry,
    });
  } catch (error) {
    console.error(
      "Update Timetable Entry Error:",
      error,
    );

    const status =
        error.code ===
        "TIMETABLE_ENTRY_NOT_FOUND"
            ? 404
            : error.code ===
                "INVALID_TIMETABLE_DAY" ||
            error.code ===
                "INVALID_TIMETABLE_TIME"
            ? 400
            : 500;

    return res.status(status).json({
      error:
        error.message ??
        "Failed to update timetable entry.",

      code:
        error.code ??
        "TIMETABLE_ENTRY_UPDATE_FAILED",
    });
  }
}

async function handleDeleteTimetableEntry(
  req,
  res,
) {
  try {
    const entry =
      await removeTimetableEntry(
        req.user.id,
        req.params.entryId,
      );

    return res.json({
      success: true,
      entryId: entry.id,
    });
  } catch (error) {
    console.error(
      "Delete Timetable Entry Error:",
      error,
    );

    const status =
      error.code ===
      "TIMETABLE_ENTRY_NOT_FOUND"
        ? 404
        : 500;

    return res.status(status).json({
      error:
        error.message ??
        "Failed to delete timetable entry.",

      code:
        error.code ??
        "TIMETABLE_ENTRY_DELETE_FAILED",
    });
  }
}

export {
  handleDeleteTimetableEntry,
  handleGetTimetable,
  handleImportTimetable,
  handlePreviewTimetable,
  handleUpdateTimetableEntry,
};