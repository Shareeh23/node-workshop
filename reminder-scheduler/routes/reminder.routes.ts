import type { IncomingMessage, ServerResponse } from "node:http";

import sendJSON from "../utils/send-json.js";
import sendError from "../utils/send-error.js";
import { getAllRemindersController } from "../controllers/reminder.controller.js";

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

  if(req.method === "GET" && req.url == "/reminder") {
    getAllRemindersController(res);
    return;
  }

  sendError(res, 404, "NOT_FOUND", "The requested resource was not found");
}
