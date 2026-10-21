import type { ServerResponse } from "node:http";

import { getAllReminders } from "../services/reminder.service.js";
import sendJSON from "../utils/send-json.js";
import sendError from "../utils/send-error.js";

export function getAllRemindersController(res: ServerResponse): void {
  try {
    const reminders = getAllReminders();
    sendJSON(res, 200, reminders, "Reminders retrieved successfully");
  } catch {
    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}
