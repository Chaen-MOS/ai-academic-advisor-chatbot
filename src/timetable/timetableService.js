import {
  parseTimetableText,
} from "./timetableParser.js";

import {
  deleteTimetableEntry,
  findTimetableEntryById,
  listUserTimetableEntries,
  replaceUserTimetableEntries,
  updateTimetableEntry,
} from "./timetableRepository.js";

async function previewTimetableImport(
  rawText,
) {
  const entries =
    parseTimetableText(rawText);

  if (entries.length === 0) {
    const error = new Error(
      "No timetable entries could be detected.",
    );

    error.code =
      "TIMETABLE_PARSE_FAILED";

    throw error;
  }

  return entries;
}

async function saveImportedTimetable(
  userId,
  entries,
) {
  if (
    !Array.isArray(entries) ||
    entries.length === 0
  ) {
    const error = new Error(
      "Timetable entries are required.",
    );

    error.code =
      "TIMETABLE_ENTRIES_REQUIRED";

    throw error;
  }

  return replaceUserTimetableEntries(
    userId,
    entries,
  );
}

const DAY_ORDER = {
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 7,
};

async function getUserTimetable(
  userId,
) {
  const entries =
    await listUserTimetableEntries(
      userId,
    );

  return entries.sort(
    (a, b) => {
      const dayDifference =
        DAY_ORDER[a.day_of_week] -
        DAY_ORDER[b.day_of_week];

      if (dayDifference !== 0) {
        return dayDifference;
      }

      return a.start_time.localeCompare(
        b.start_time,
      );
    },
  );
}
const VALID_DAYS = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];

function validateTimetableUpdates(
  updates,
) {
  if (
    updates.dayOfWeek !== undefined &&
    !VALID_DAYS.includes(
      updates.dayOfWeek,
    )
  ) {
    const error = new Error(
      "Invalid timetable day.",
    );

    error.code =
      "INVALID_TIMETABLE_DAY";

    throw error;
  }

  const timePattern =
    /^([01]\d|2[0-3]):[0-5]\d$/;

  for (const field of [
    "startTime",
    "endTime",
  ]) {
    if (
      updates[field] !== undefined &&
      !timePattern.test(
        updates[field],
      )
    ) {
      const error = new Error(
        "Invalid timetable time.",
      );

      error.code =
        "INVALID_TIMETABLE_TIME";

      throw error;
    }
  }
}

async function editTimetableEntry(
  userId,
  entryId,
  updates,
) {
    validateTimetableUpdates(
    updates,
  );
  const existing =
    await findTimetableEntryById(
      entryId,
      userId,
    );

  if (!existing) {
    const error = new Error(
      "Timetable entry not found.",
    );

    error.code =
      "TIMETABLE_ENTRY_NOT_FOUND";

    throw error;
  }

  return updateTimetableEntry(
    entryId,
    userId,
    updates,
  );
}

async function removeTimetableEntry(
  userId,
  entryId,
) {
  const existing =
    await findTimetableEntryById(
      entryId,
      userId,
    );

  if (!existing) {
    const error = new Error(
      "Timetable entry not found.",
    );

    error.code =
      "TIMETABLE_ENTRY_NOT_FOUND";

    throw error;
  }

  return deleteTimetableEntry(
    entryId,
    userId,
  );
}

export {
  editTimetableEntry,
  getUserTimetable,
  previewTimetableImport,
  removeTimetableEntry,
  saveImportedTimetable,
};