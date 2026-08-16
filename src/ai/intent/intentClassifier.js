import {
  INTENTS,
} from "./intentTypes.js";

function includesAny(
  text,
  keywords,
) {
  return keywords.some(
    keyword =>
      text.includes(keyword),
  );
}

function classifyIntent(
  question,
) {
  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    return INTENTS.GENERAL;
  }

  const text =
    question
      .trim()
      .toLowerCase();

  if (
    includesAny(text, [
      "cgpa",
      "gpa",
      "target cgpa",
      "highest cgpa",
      "highest possible",
      "grade point",
    ])
  ) {
    return INTENTS.CGPA;
  }

  if (
    includesAny(text, [
        "what do i have",
        "what do i have today",
        "what do i have tomorrow",
        "what do i have on",
        "am i free",
        "my schedule",
        "what is scheduled",
    ])
    ) {
    return INTENTS.SCHEDULE;
    }

  if (
    includesAny(text, [
      "timetable",
      "class",
      "classes",
      "lecture",
      "tutorial",
      "practical",
      "lab",
      "next class",
      "class on",
    ])
  ) {
    return INTENTS.TIMETABLE;
  }

  if (
    includesAny(text, [
        "event",
        "events",
        "appointment",
        "appointments",
        "meeting",
        "meetings",
        "deadline",
        "personal event",
    ])
    ) {
    return INTENTS.EVENT;
    }

  if (
    includesAny(text, [
      "graduate",
      "graduation",
      "graduating",
      "complete my degree",
      "finish my degree",
    ])
  ) {
    return INTENTS.GRADUATION;
  }

  if (
    includesAny(text, [
      "register",
      "registration",
      "credit hours",
      "credits can i take",
      "maximum credits",
      "add course",
      "drop course",
    ])
  ) {
    return INTENTS
      .COURSE_REGISTRATION;
  }

  if (
    includesAny(text, [
      "probation",
      "warning",
      "academic standing",
      "terminated",
      "normal standing",
    ])
  ) {
    return INTENTS
      .ACADEMIC_STANDING;
  }

  if (
    includesAny(text, [
      "leave of absence",
      "loa",
      "credit transfer",
      "course exemption",
      "appeal",
      "administrative",
    ])
  ) {
    return INTENTS
      .ADMINISTRATION;
  }

  return INTENTS.GENERAL;
}

export {
  classifyIntent,
};