import {supabaseAdmin} from "../config/supabaseAdmin.js";

async function replaceUserTimetableEntries(
  userId,
  entries,
) {
  const {error: deleteError} =
    await supabaseAdmin
      .from("timetable_entries")
      .delete()
      .eq("user_id", userId);

  if (deleteError) {
    throw new Error(
      `Failed to clear timetable: ${deleteError.message}`,
    );
  }

  const rows = entries.map(entry => ({
    user_id: userId,
    course_code: entry.courseCode,
    course_name: entry.courseName,
    class_type: entry.classType,
    class_group: entry.classGroup,
    day_of_week: entry.dayOfWeek,
    start_time: entry.startTime,
    end_time: entry.endTime,
    reminder_minutes: 30,
    is_enabled: true,
  }));

  const {data, error} =
    await supabaseAdmin
      .from("timetable_entries")
      .insert(rows)
      .select("*");

  if (error) {
    throw new Error(
      `Failed to save timetable: ${error.message}`,
    );
  }

  return data ?? [];
}

async function listUserTimetableEntries(
  userId,
) {
  const {data, error} =
    await supabaseAdmin
      .from("timetable_entries")
      .select("*")
      .eq("user_id", userId)
      .order("day_of_week", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

  if (error) {
    throw new Error(
      `Failed to load timetable: ${error.message}`,
    );
  }

  return data ?? [];
}

async function findTimetableEntryById(
  entryId,
  userId,
) {
  const {data, error} =
    await supabaseAdmin
      .from("timetable_entries")
      .select("*")
      .eq("id", entryId)
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load timetable entry: ${error.message}`,
    );
  }

  return data;
}

async function updateTimetableEntry(
  entryId,
  userId,
  updates,
) {
  const payload = {
    course_code:
      updates.courseCode,
    course_name:
      updates.courseName,
    class_type:
      updates.classType,
    class_group:
      updates.classGroup,
    day_of_week:
      updates.dayOfWeek,
    start_time:
      updates.startTime,
    end_time:
      updates.endTime,
    reminder_minutes:
      updates.reminderMinutes,
    is_enabled:
      updates.isEnabled,
    updated_at:
      new Date().toISOString(),
  };

  Object.keys(payload).forEach(
    key => {
      if (
        payload[key] === undefined
      ) {
        delete payload[key];
      }
    },
  );

  const {data, error} =
    await supabaseAdmin
      .from("timetable_entries")
      .update(payload)
      .eq("id", entryId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to update timetable entry: ${error.message}`,
    );
  }

  return data;
}

async function deleteTimetableEntry(
  entryId,
  userId,
) {
  const {data, error} =
    await supabaseAdmin
      .from("timetable_entries")
      .delete()
      .eq("id", entryId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to delete timetable entry: ${error.message}`,
    );
  }

  return data;
}

export {
  deleteTimetableEntry,
  findTimetableEntryById,
  listUserTimetableEntries,
  replaceUserTimetableEntries,
  updateTimetableEntry,
};