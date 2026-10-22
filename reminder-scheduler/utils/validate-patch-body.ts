import type { Reminder } from "../types/reminder.js";

export type PatchReminderInput = Partial<
  Pick<Reminder, "title" | "scheduledAt">
>;

export default function validatePatchBody(
  body: unknown,
): body is PatchReminderInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return false;
  }

  const keys = Object.keys(body);

  if (keys.length === 0) {
    return false;
  }

  if (keys.some((key) => key !== "title" && key !== "scheduledAt")) {
    return false;
  }

  if ("title" in body) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return false;
    }
  }

  if ("scheduledAt" in body) {
    if (typeof body.scheduledAt !== "string" || !body.scheduledAt.trim()) {
      return false;
    }

    const scheduledDate = new Date(body.scheduledAt);

    if (
      Number.isNaN(scheduledDate.getTime()) ||
      scheduledDate.getTime() <= Date.now()
    ) {
      return false;
    }
  }

  return true;
}
