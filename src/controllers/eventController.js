import {
  addUserEvent,
  editUserEvent,
  getUserEvents,
  removeUserEvent,
} from "../events/eventService.js";

function getEventErrorStatus(error) {
  if (
    error.code ===
    "EVENT_NOT_FOUND"
  ) {
    return 404;
  }

  if (
    [
      "EVENT_TITLE_REQUIRED",
      "INVALID_EVENT_TITLE",
      "INVALID_EVENT_DATE",
      "INVALID_EVENT_TIME",
      "INVALID_REMINDER_MINUTES",
      "INVALID_EVENT_STATUS",
    ].includes(error.code)
  ) {
    return 400;
  }

  return 500;
}

async function handleGetEvents(
  req,
  res,
) {
  try {
    const events =
      await getUserEvents(
        req.user.id,
      );

    return res.json({
      events,
    });
  } catch (error) {
    console.error(
      "Get Events Error:",
      error,
    );

    return res.status(500).json({
      error:
        error.message ??
        "Failed to load events.",

      code:
        error.code ??
        "EVENT_LIST_FAILED",
    });
  }
}

async function handleCreateEvent(
  req,
  res,
) {
  try {
    const event =
      await addUserEvent(
        req.user.id,
        req.body,
      );

    return res
      .status(201)
      .json({
        event,
      });
  } catch (error) {
    console.error(
      "Create Event Error:",
      error,
    );

    return res
      .status(
        getEventErrorStatus(
          error,
        ),
      )
      .json({
        error:
          error.message ??
          "Failed to create event.",

        code:
          error.code ??
          "EVENT_CREATE_FAILED",
      });
  }
}

async function handleUpdateEvent(
  req,
  res,
) {
  try {
    const event =
      await editUserEvent(
        req.user.id,
        req.params.eventId,
        req.body,
      );

    return res.json({
      event,
    });
  } catch (error) {
    console.error(
      "Update Event Error:",
      error,
    );

    return res
      .status(
        getEventErrorStatus(
          error,
        ),
      )
      .json({
        error:
          error.message ??
          "Failed to update event.",

        code:
          error.code ??
          "EVENT_UPDATE_FAILED",
      });
  }
}

async function handleDeleteEvent(
  req,
  res,
) {
  try {
    const event =
      await removeUserEvent(
        req.user.id,
        req.params.eventId,
      );

    return res.json({
      success: true,
      eventId: event.id,
    });
  } catch (error) {
    console.error(
      "Delete Event Error:",
      error,
    );

    return res
      .status(
        getEventErrorStatus(
          error,
        ),
      )
      .json({
        error:
          error.message ??
          "Failed to delete event.",

        code:
          error.code ??
          "EVENT_DELETE_FAILED",
      });
  }
}

export {
  handleCreateEvent,
  handleDeleteEvent,
  handleGetEvents,
  handleUpdateEvent,
};