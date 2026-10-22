import { IncomingMessage, ServerResponse } from "node:http";

import type { Reminder } from "../types/reminder.js";

import {
  getAllReminders,
  getReminderById,
  createReminder,
  patchReminder,
  deleteReminder,
} from "../services/reminder.service.js";
import sendJSON from "../utils/send-json.js";
import sendError from "../utils/send-error.js";
import bodyParser from "../utils/body-parser.js";
import validatePostBody from "../utils/validate-post-body.js";
import validatePatchBody from "../utils/validate-patch-body.js";

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

export async function postReminderController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const body = await bodyParser(req);

    if (!validatePostBody(body)) {
      sendError(
        res,
        400,
        "INVALID_BODY",
        "A non-empty title and scheduledAt timestamp are required",
      );
      return;
    }

    const reminder = createReminder(body.title, body.scheduledAt);

    sendJSON(res, 201, reminder, "Reminder created successfully");
  } catch (err) {
    if (err instanceof SyntaxError) {
      sendError(
        res,
        400,
        "INVALID_JSON",
        "Request body must contain valid JSON",
      );
      return;
    }

    if (err instanceof Error && err.message === "EMPTY_BODY") {
      sendError(res, 400, "EMPTY_BODY", "Request body is required");
      return;
    }

    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}

export async function patchReminderController(
  req: IncomingMessage,
  res: ServerResponse,
  id: string,
) {
  try {
    const body = await bodyParser(req);

    if (!validatePatchBody(body)) {
      sendError(
        res,
        400,
        "INVALID_BODY",
        "Provide a valid title and/or scheduledAt timestamp. Only these fields are allowed.",
      );
      return;
    }

    const reminder = patchReminder(id, body.title, body.scheduledAt);

    if (!reminder) {
      sendError(res, 404, "NOT_FOUND", "Reminder not found");
      return;
    }

    sendJSON(res, 200, reminder, "Reminder updated successfully");
  } catch (err) {
    if (err instanceof SyntaxError) {
      sendError(
        res,
        400,
        "INVALID_JSON",
        "Request body must contain valid JSON",
      );
      return;
    }

    if (err instanceof Error && err.message === "EMPTY_BODY") {
      sendError(res, 400, "EMPTY_BODY", "Request body is required");
      return;
    }

    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}

export function deleteReminderController(
  res: ServerResponse,
  id: Reminder["id"],
) {
  try {
    const reminder = deleteReminder(id);

    if (!reminder) {
      sendError(res, 404, "NOT_FOUND", "Reminder not found");
      return;
    }

    sendJSON(res, 200, reminder, "Reminder deleted successfully");
  } catch {
    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}
