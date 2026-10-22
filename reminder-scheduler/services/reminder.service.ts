import type { Reminder, Reminders } from "../types/reminder.js";

const reminders: Reminders = [];

export function getAllReminders() {
  return reminders;
}

export function getReminderById(id: Reminder["id"]) {
  return reminders.find((reminder) => reminder.id === id);
}

export function createReminder(
  title: Reminder["title"],
  scheduledAt: Reminder["scheduledAt"],
): Reminder {
  const reminder = {
    id: crypto.randomUUID(),
    title,
    scheduledAt,
    status: "pending",
  } satisfies Reminder;

  reminders.push(reminder);

  return reminder;
}

export function patchReminder(
  id: Reminder["id"],
  title?: Reminder["title"],
  scheduledAt?: Reminder["scheduledAt"],
) {
  const reminder = reminders.find((reminder) => reminder.id === id);

  if (reminder) {
    if (title) reminder.title = title;
    if (scheduledAt) reminder.scheduledAt = scheduledAt;
  }

  return reminder;
}

export function deleteReminder(id: Reminder["id"]) {
  const index = reminders.findIndex((reminder) => reminder.id === id);

  if (index === -1) {
    return undefined;
  }

  return reminders.splice(index, 1)[0];
}