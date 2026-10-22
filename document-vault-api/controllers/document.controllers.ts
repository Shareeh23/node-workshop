import type { IncomingMessage, ServerResponse } from "node:http";

import bodyParser from "../utils/body-parser.js";
import sendJSON from "../utils/send-json.js";
import sendError from "../utils/send-error.js";

import {
  createDocument as createDocumentService,
  getDocuments as getDocumentsService,
  getDocumentById as getDocumentByIdService,
  updateDocument as updateDocumentService,
  deleteDocument as deleteDocumentService,
  uploadDocument as uploadDocumentService,
} from "../services/document.services.js";

import type { CreateDocumentInput } from "../types/document.types.js";

export function getHealth(_req: IncomingMessage, res: ServerResponse) {
  sendJSON(res, 200, { status: "ok" }, "Document Vault API is running");
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

export async function getDocuments(_req: IncomingMessage, res: ServerResponse) {
  try {
    const documents = await getDocumentsService();

    sendJSON(res, 200, documents, "Documents retrieved successfully");
  } catch (err) {
    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}

export async function getDocumentById(
  _req: IncomingMessage,
  res: ServerResponse,
  id: string,
) {
  try {
    const document = await getDocumentByIdService(id);

    if (!document) {
      sendError(res, 404, "DOCUMENT_NOT_FOUND", "Document not found");
      return;
    }

    sendJSON(res, 200, document, "Document retrieved successfully");
  } catch (err) {
    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}

export async function updateDocument(
  req: IncomingMessage,
  res: ServerResponse,
  id: string,
) {
  try {
    const body = await bodyParser(req);

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      sendError(res, 400, "INVALID_BODY", "Request body must be a JSON object");
      return;
    }

    const input = body as Record<string, unknown>;
    const updates: Partial<CreateDocumentInput> = {};

    if ("name" in input) {
      if (typeof input.name !== "string" || !input.name.trim()) {
        sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "Name must be a non-empty string",
        );
        return;
      }
      updates.name = input.name;
    }

    if ("description" in input) {
      if (typeof input.description !== "string") {
        sendError(res, 400, "VALIDATION_ERROR", "Description must be a string");
        return;
      }
      updates.description = input.description;
    }

    if ("tags" in input) {
      if (
        !Array.isArray(input.tags) ||
        !input.tags.every((tag) => typeof tag === "string")
      ) {
        sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "Tags must be an array of strings",
        );
        return;
      }
      updates.tags = input.tags;
    }

    if (Object.keys(updates).length === 0) {
      sendError(res, 400, "VALIDATION_ERROR", "No supported fields provided");
      return;
    }

    const document = await updateDocumentService(id, updates);

    if (!document) {
      sendError(res, 404, "DOCUMENT_NOT_FOUND", "Document not found");
      return;
    }

    sendJSON(res, 200, document, "Document updated successfully");
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

export async function deleteDocument(
  _req: IncomingMessage,
  res: ServerResponse,
  id: string,
) {
  try {
    const deleted = await deleteDocumentService(id);

    if (!deleted) {
      sendError(res, 404, "DOCUMENT_NOT_FOUND", "Document not found");
      return;
    }

    res.writeHead(204);
    res.end();
  } catch (err) {
    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}

export async function uploadDocument(
  req: IncomingMessage,
  res: ServerResponse,
  id: string,
) {
  try {
    const originalFileName = req.headers["x-file-name"];
    const mimeType = req.headers["content-type"];

    if (typeof originalFileName !== "string" || typeof mimeType !== "string") {
      sendError(
        res,
        400,
        "MISSING_HEADERS",
        "X-File-Name and Content-Type headers are required",
      );
      return;
    }

    const document = await uploadDocumentService(
      id,
      originalFileName,
      mimeType,
      req,
    );

    if (!document) {
      sendError(res, 404, "DOCUMENT_NOT_FOUND", "Document not found");
      return;
    }

    sendJSON(
      res,
      200,
      {
        id: document.id,
        originalFileName: document.originalFileName,
        mimeType: document.mimeType,
        size: document.size,
      },
      "File uploaded successfully",
    );
  } catch (err) {
    if (err instanceof Error) {
      switch (err.message) {
        case "INVALID_FILENAME":
          sendError(
            res,
            400,
            "INVALID_FILENAME",
            "A valid filename is required",
          );
          return;

        case "UNSUPPORTED_FILE_TYPE":
          sendError(
            res,
            415,
            "UNSUPPORTED_FILE_TYPE",
            "File type is not supported",
          );
          return;

        case "FILE_TOO_LARGE":
          sendError(res, 413, "FILE_TOO_LARGE", "File exceeds the 10 MB limit");
          return;
      }
    }

    sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
    );
  }
}
