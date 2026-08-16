
import {
  getUserEvents,
} from "../../events/eventService.js";

async function buildEventContext(
  userId,
) {
  const events =
    await getUserEvents(
      userId,
    );

  const activeEvents =
    events.filter(
      event =>
        !event.is_completed,
    );

  if (
    activeEvents.length === 0
  ) {
    return `
Student Events:
No active personal events are currently available.
`;
  }

  const lines =
    activeEvents.map(event => {
      return [
        `- ${event.title}`,
        event.event_date,
        event.event_time,
        event.description
          ? `Description: ${event.description}`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");
    });

  return `
Student Events:
${lines.join("\n")}
`;
}

export {
  buildEventContext,
};