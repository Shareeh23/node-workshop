import type { IncomingMessage, ServerResponse } from "node:http";

import bodyParser from "../utils/body-parser.js";
import sendJSON from "../utils/send-json.js";
import sendError from "../utils/send-error.js";

export function getHealth(_req: IncomingMessage, res: ServerResponse) {
  sendJSON(res, 200, { status: "ok" }, "Document Vault API is running");
}

export async function createDocument(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const body = await bodyParser(req);

    console.log(body);

    // TODO: Write body to the JSON file.

    sendJSON(res, 200, null, "Document received");
  } catch (err) {
    if (err instanceof SyntaxError) {
      sendError(res, 400, "INVALID_JSON", "Request body is malformed");
      return;
    }

    if (err instanceof Error && err.message === "EMPTY_BODY") {
      sendError(res, 400, "EMPTY_BODY", "Request body is required");
      return;
    }

    console.error("Request processing error:", err);

    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}
