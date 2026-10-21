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
