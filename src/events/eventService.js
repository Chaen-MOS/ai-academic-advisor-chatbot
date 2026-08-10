import {
  createUserEvent,
  deleteUserEvent,
  findUserEventById,
  listUserEvents,
  updateUserEvent,
} from "./eventRepository.js";

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;

const TIME_PATTERN =
  /^([01]\d|2[0-3]):[0-5]\d$/;

function createEventError(
  message,
  code,
) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function validateTitle(title) {
  if (
    typeof title !== "string" ||
    !title.trim()
  ) {
    throw createEventError(
      "Event title is required.",
      "EVENT_TITLE_REQUIRED",
    );
  }

  if (title.trim().length > 120) {
    throw createEventError(
      "Event title is too long.",
      "INVALID_EVENT_TITLE",
    );
  }
}

function validateEventDate(
  eventDate,
) {
  if (
    typeof eventDate !== "string" ||
    !DATE_PATTERN.test(eventDate)
  ) {
    throw createEventError(
      "Invalid event date.",
      "INVALID_EVENT_DATE",
    );
  }

  const date =
    new Date(
      `${eventDate}T00:00:00`,
    );

  if (
    Number.isNaN(date.getTime())
  ) {
    throw createEventError(
      "Invalid event date.",
      "INVALID_EVENT_DATE",
    );
  }
}

function validateEventTime(
  eventTime,
) {
  if (
    typeof eventTime !== "string" ||
    !TIME_PATTERN.test(eventTime)
  ) {
    throw createEventError(
      "Invalid event time.",
      "INVALID_EVENT_TIME",
    );
  }
}

function validateReminderMinutes(
  reminderMinutes,
) {
  if (
    !Number.isInteger(
      reminderMinutes,
    ) ||
    reminderMinutes < 0
  ) {
    throw createEventError(
      "Invalid reminder time.",
      "INVALID_REMINDER_MINUTES",
    );
  }
}

async function getUserEvents(
  userId,
) {
  return listUserEvents(userId);
}

async function addUserEvent(
  userId,
  input,
) {
  validateTitle(input.title);
  validateEventDate(
    input.eventDate,
  );
  validateEventTime(
    input.eventTime,
  );

  const reminderMinutes =
    input.reminderMinutes ?? 30;

  validateReminderMinutes(
    reminderMinutes,
  );

  return createUserEvent({
    userId,

    title:
      input.title.trim(),

    description:
      typeof input.description ===
        "string" &&
      input.description.trim()
        ? input.description.trim()
        : null,

    eventDate:
      input.eventDate,

    eventTime:
      input.eventTime,

    reminderMinutes,
  });
}

async function editUserEvent(
  userId,
  eventId,
  updates,
) {
  const existing =
    await findUserEventById(
      eventId,
      userId,
    );

  if (!existing) {
    throw createEventError(
      "Event not found.",
      "EVENT_NOT_FOUND",
    );
  }

  if (
    updates.title !== undefined
  ) {
    validateTitle(
      updates.title,
    );

    updates.title =
      updates.title.trim();
  }

  if (
    updates.description !==
    undefined
  ) {
    updates.description =
      typeof updates.description ===
        "string" &&
      updates.description.trim()
        ? updates.description.trim()
        : null;
  }

  if (
    updates.eventDate !==
    undefined
  ) {
    validateEventDate(
      updates.eventDate,
    );
  }

  if (
    updates.eventTime !==
    undefined
  ) {
    validateEventTime(
      updates.eventTime,
    );
  }

  if (
    updates.reminderMinutes !==
    undefined
  ) {
    validateReminderMinutes(
      updates.reminderMinutes,
    );
  }

  if (
    updates.isCompleted !==
      undefined &&
    typeof updates.isCompleted !==
      "boolean"
  ) {
    throw createEventError(
      "Invalid completed status.",
      "INVALID_EVENT_STATUS",
    );
  }

  return updateUserEvent(
    eventId,
    userId,
    updates,
  );
}

async function removeUserEvent(
  userId,
  eventId,
) {
  const existing =
    await findUserEventById(
      eventId,
      userId,
    );

  if (!existing) {
    throw createEventError(
      "Event not found.",
      "EVENT_NOT_FOUND",
    );
  }

  return deleteUserEvent(
    eventId,
    userId,
  );
}

export {
  addUserEvent,
  editUserEvent,
  getUserEvents,
  removeUserEvent,
};