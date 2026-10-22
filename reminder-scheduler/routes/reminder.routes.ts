import type { IncomingMessage, ServerResponse } from "node:http";

import sendJSON from "../utils/send-json.js";
import sendError from "../utils/send-error.js";
import {
  getAllRemindersController,
  getReminderByIdController,
  postReminderController,
  patchReminderController,
  deleteReminderController
} from "../controllers/reminder.controller.js";

export function routeHandler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "GET" && req.url === "/health") {
    sendJSON(
      res,
      200,
      {
        status: "ok",
      },
      "Server is running",
    );

    return;
  }

  if (req.method === "GET" && req.url === "/reminders") {
    getAllRemindersController(res);
    return;
  }

  if (req.method === "GET" && req.url?.startsWith("/reminders/")) {
    const id = req.url.split("/")[2];

    if (id) {
      getReminderByIdController(res, id);
      return;
    }

    sendError(res, 404, "MISSING_ID", "Reminder ID is required");
    return;
  }

  if (req.method === "POST" && req.url === "/reminders") {
    void postReminderController(req, res);
    return;
  }

  if (req.method === "PATCH" && req.url?.startsWith("/reminders/")) {
    const id = req.url.split("/")[2];

    if (id) {
      void patchReminderController(req, res, id);
      return;
    }

    sendError(res, 404, "MISSING_ID", "Reminder ID is required");
    return;
  }

  if (req.method === "DELETE" && req.url?.startsWith("/reminders/")) {
    const id = req.url.split("/")[2];

    if (id) {
      deleteReminderController(res, id);
      return;
    }

    sendError(res, 404, "MISSING_ID", "Reminder ID is required");
    return;
  }

  sendError(res, 404, "NOT_FOUND", "The requested resource was not found");
}
