const DAY_MAP = {
  MON: "MON",
  MONDAY: "MON",
  TUE: "TUE",
  TUESDAY: "TUE",
  WED: "WED",
  WEDNESDAY: "WED",
  THU: "THU",
  THURSDAY: "THU",
  FRI: "FRI",
  FRIDAY: "FRI",
  SAT: "SAT",
  SATURDAY: "SAT",
  SUN: "SUN",
  SUNDAY: "SUN",
};

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function normalizeDay(value) {
  const normalized =
    normalizeWhitespace(value)
      .replace(/[|]/g, "")
      .toUpperCase();

  return DAY_MAP[normalized] ?? null;
}

function convertTimeTo24Hour(value) {
  const normalized =
    normalizeWhitespace(value)
      .toUpperCase();

  const match = normalized.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/,
  );

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3];

  if (
    hour < 1 ||
    hour > 12 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  if (
    period === "AM" &&
    hour === 12
  ) {
    hour = 0;
  }

  if (
    period === "PM" &&
    hour !== 12
  ) {
    hour += 12;
  }

  return `${String(hour).padStart(
    2,
    "0",
  )}:${String(minute).padStart(
    2,
    "0",
  )}`;
}

function parseTimeRange(value) {
  const normalized =
    normalizeWhitespace(value);

  const match = normalized.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
  );

  if (!match) {
    return null;
  }

  const startTime =
    convertTimeTo24Hour(
      match[1],
    );

  const endTime =
    convertTimeTo24Hour(
      match[2],
    );

  if (
    !startTime ||
    !endTime
  ) {
    return null;
  }

  return {
    startTime,
    endTime,
  };
}

function extractCourseCode(value) {
  const match =
    String(value ?? "").match(
      /\b[A-Z]{4}\d{4}\b/i,
    );

  return match
    ? match[0].toUpperCase()
    : null;
}

function normalizeClassType(value) {
  const normalized =
    normalizeWhitespace(value)
      .toUpperCase();

  if (
    ["L", "P", "T"].includes(
      normalized,
    )
  ) {
    return normalized;
  }

  return null;
}

function cleanCell(value) {
  return normalizeWhitespace(
    String(value ?? "")
      // Keep visible Markdown link text.
      .replace(
        /\[([^\]]+)\]\([^]*?\)/g,
        "$1",
      )
      // Remove HTML break tags.
      .replace(
        /<br\s*\/?>/gi,
        " ",
      )
      // Remove markdown escapes.
      .replace(/\\:/g, ":"),
  );
}

function splitRow(line) {
  /*
   * Markdown table:
   * | 1 | UECS2153 | AI | L | ...
   */
  if (line.includes("|")) {
    return line
      .split("|")
      .map(cleanCell)
      .filter(Boolean);
  }

  /*
   * Browser table copy normally uses tabs.
   */
  if (line.includes("\t")) {
    return line
      .split("\t")
      .map(cleanCell)
      .filter(Boolean);
  }

  return [
    cleanCell(line),
  ].filter(Boolean);
}

function isMarkdownSeparator(
  cells,
) {
  if (cells.length === 0) {
    return false;
  }

  return cells.every(cell =>
    /^:?-{2,}:?$/.test(cell),
  );
}

function parseTimetableText(
  rawText,
) {
  if (
    typeof rawText !== "string" ||
    !rawText.trim()
  ) {
    return [];
  }

  const lines = rawText
    .replace(/\r/g, "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const entries = [];

  let currentCourse = null;

  for (const line of lines) {
    const cells =
      splitRow(line);

    if (
      cells.length === 0 ||
      isMarkdownSeparator(
        cells,
      )
    ) {
      continue;
    }

    /*
     * Ignore table header.
     */
    const upperLine =
      line.toUpperCase();

    if (
      upperLine.includes(
        "DESCRIPTION",
      ) &&
      upperLine.includes("DAY") &&
      upperLine.includes("TIME")
    ) {
      continue;
    }

    /*
     * Detect a new course row.
     */
    const courseCode =
      cells
        .map(extractCourseCode)
        .find(Boolean) ??
      null;

    if (courseCode) {
      const courseCodeIndex =
        cells.findIndex(
          cell =>
            extractCourseCode(
              cell,
            ) === courseCode,
        );

      const classTypeIndex =
        cells.findIndex(
          cell =>
            normalizeClassType(
              cell,
            ) !== null,
        );

      const classType =
        classTypeIndex >= 0
          ? normalizeClassType(
              cells[
                classTypeIndex
              ],
            )
          : null;

      let courseName =
        courseCode;

      if (
        courseCodeIndex >= 0 &&
        classTypeIndex >
          courseCodeIndex
      ) {
        courseName =
          cells
            .slice(
              courseCodeIndex + 1,
              classTypeIndex,
            )
            .join(" ")
            .trim() ||
          courseCode;
      }

      let classGroup = null;

      if (
        classTypeIndex >= 0
      ) {
        const possibleGroup =
          cells[
            classTypeIndex + 1
          ];

        if (
          possibleGroup &&
          /^\d+$/.test(
            possibleGroup,
          )
        ) {
          classGroup =
            possibleGroup;
        }
      }

      currentCourse = {
        courseCode,
        courseName,
        classType,
        classGroup,
      };
    }

    /*
     * Find day anywhere in the row.
     */
    const dayOfWeek =
      cells
        .map(normalizeDay)
        .find(Boolean) ??
      null;

    /*
     * Find time range anywhere
     * in the row.
     */
    const timeRange =
      cells
        .map(parseTimeRange)
        .find(Boolean) ??
      null;

    if (
      !currentCourse ||
      !dayOfWeek ||
      !timeRange
    ) {
      continue;
    }

    entries.push({
      courseCode:
        currentCourse.courseCode,

      courseName:
        currentCourse.courseName,

      classType:
        currentCourse.classType,

      classGroup:
        currentCourse.classGroup,

      dayOfWeek,

      startTime:
        timeRange.startTime,

      endTime:
        timeRange.endTime,
    });
  }

  return entries;
}

export {
  convertTimeTo24Hour,
  normalizeDay,
  parseTimeRange,
  parseTimetableText,
};