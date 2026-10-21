import type { Reminder } from "../types/reminder.js";

export type CreateReminderInput = {
  title: Reminder["title"];
  scheduledAt: Reminder["scheduledAt"];
};

export default function validateBody(
  body: unknown,
): body is CreateReminderInput {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  if (
    !("title" in body) ||
    typeof body.title !== "string" ||
    !body.title.trim()
  ) {
    return false;
  }

  if (
    !("scheduledAt" in body) ||
    typeof body.scheduledAt !== "string" ||
    !body.scheduledAt.trim()
  ) {
    return false;
  }

  const scheduledDate = new Date(body.scheduledAt);

  if (
    Number.isNaN(scheduledDate.getTime()) ||
    scheduledDate.getTime() <= Date.now()
  ) {
    return false;
  }

  return true;
}
