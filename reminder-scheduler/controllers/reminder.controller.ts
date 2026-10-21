import type { ServerResponse } from "node:http";

import type { Reminder } from "../types/reminder.js";

import {
  getAllReminders,
  getReminderById,
} from "../services/reminder.service.js";
import sendJSON from "../utils/send-json.js";
import sendError from "../utils/send-error.js";

export function getAllRemindersController(res: ServerResponse) {
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

export function getReminderByIdController(
  res: ServerResponse,
  id: Reminder["id"],
) {
  try {
    const reminder = getReminderById(id);

    if (!reminder) {
      sendError(res, 404, "NOT_FOUND", "Reminder not found");
      return;
    }

    sendJSON(res, 200, reminder, "Reminder retrieved successfully");
  } catch {
    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}
