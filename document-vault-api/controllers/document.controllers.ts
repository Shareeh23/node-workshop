import type { IncomingMessage, ServerResponse } from "node:http";

import bodyParser from "../utils/body-parser.js";
import sendJSON from "../utils/send-json.js";
import sendError from "../utils/send-error.js";

import {
  createDocument as createDocumentService,
  getDocuments as getDocumentsService,
} from "../services/document.services.js";

import type { CreateDocumentInput } from "../types/document.types.js";

export function getHealth(_req: IncomingMessage, res: ServerResponse) {
  sendJSON(res, 200, { status: "ok" }, "Document Vault API is running");
}

export async function getDocuments(_req: IncomingMessage, res: ServerResponse) {
  try {
    const documents = await getDocumentsService();

    sendJSON(res, 200, documents, "Documents retrieved successfully");
  } catch (err) {
    console.error("Error retrieving documents:", err);
    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}

export async function createDocument(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const body = await bodyParser(req);

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      sendError(res, 400, "INVALID_BODY", "Request body must be a JSON object");
      return;
    }

    const input = body as Record<string, unknown>;

    if (
      typeof input.name !== "string" ||
      !input.name.trim() ||
      typeof input.description !== "string" ||
      !Array.isArray(input.tags) ||
      !input.tags.every((tag) => typeof tag === "string")
    ) {
      sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Provide a name, description, and an array of string tags",
      );
      return;
    }

    const documentInput: CreateDocumentInput = {
      name: input.name as string,
      description: input.description as string,
      tags: input.tags as string[],
    };

    const document = await createDocumentService(documentInput);

    sendJSON(res, 201, document, "Document created successfully");
  } catch (err) {
    if (err instanceof SyntaxError) {
      sendError(res, 400, "INVALID_JSON", "Request body is malformed");
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
