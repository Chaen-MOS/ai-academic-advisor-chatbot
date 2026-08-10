import {
  supabaseAdmin,
} from "../config/supabaseAdmin.js";

async function createUserEvent({
  userId,
  title,
  description = null,
  eventDate,
  eventTime,
  reminderMinutes = 30,
}) {
  const {data, error} =
    await supabaseAdmin
      .from("user_events")
      .insert({
        user_id: userId,
        title,
        description,
        event_date: eventDate,
        event_time: eventTime,
        reminder_minutes:
          reminderMinutes,
        is_completed: false,
      })
      .select("*")
      .single();

  if (error) {
    throw new Error(
      `Failed to create event: ${error.message}`,
    );
  }

  return data;
}

async function listUserEvents(
  userId,
) {
  const {data, error} =
    await supabaseAdmin
      .from("user_events")
      .select("*")
      .eq("user_id", userId)
      .order("event_date", {
        ascending: true,
      })
      .order("event_time", {
        ascending: true,
      });

  if (error) {
    throw new Error(
      `Failed to load events: ${error.message}`,
    );
  }

  return data ?? [];
}

async function findUserEventById(
  eventId,
  userId,
) {
  const {data, error} =
    await supabaseAdmin
      .from("user_events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load event: ${error.message}`,
    );
  }

  return data;
}

async function updateUserEvent(
  eventId,
  userId,
  updates,
) {
  const payload = {
    title: updates.title,
    description:
      updates.description,
    event_date:
      updates.eventDate,
    event_time:
      updates.eventTime,
    reminder_minutes:
      updates.reminderMinutes,
    is_completed:
      updates.isCompleted,
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
      .from("user_events")
      .update(payload)
      .eq("id", eventId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to update event: ${error.message}`,
    );
  }

  return data;
}

async function deleteUserEvent(
  eventId,
  userId,
) {
  const {data, error} =
    await supabaseAdmin
      .from("user_events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to delete event: ${error.message}`,
    );
  }

  return data;
}

export {
  createUserEvent,
  deleteUserEvent,
  findUserEventById,
  listUserEvents,
  updateUserEvent,
};