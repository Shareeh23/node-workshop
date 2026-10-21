import type { Reminder, Reminders } from "../types/reminder.js";

const reminders: Reminders = [];

export function getAllReminders() {
  return reminders;
}

export function getReminderById(id: Reminder["id"]) {
  return reminders.find((reminder) => reminder.id === id);
}
