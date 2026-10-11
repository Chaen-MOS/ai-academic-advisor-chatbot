import {
  getUserTimetable,
} from "../../timetable/timetableService.js";

async function buildTimetableContext(
  userId,
) {
  const entries =
    await getUserTimetable(
      userId,
    );

  if (
    !Array.isArray(entries) ||
    entries.length === 0
  ) {
    return `
Student Timetable:
No timetable entries are currently available.
`;
  }

  const lines =
    entries.map(entry => {
      return [
        `- ${entry.course_code}`,
        entry.course_name
          ? `(${entry.course_name})`
          : "",
        `${entry.class_type ?? ""}`,
        entry.class_group
          ? `Group ${entry.class_group}`
          : "",
        `${entry.day_of_week}`,
        `${entry.start_time} - ${entry.end_time}`,
      ]
        .filter(Boolean)
        .join(" ");
    });

  return `
Student Timetable:
${lines.join("\n")}
`;
}

export {
  buildTimetableContext,
};