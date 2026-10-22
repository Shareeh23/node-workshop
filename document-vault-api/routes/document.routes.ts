import type { IncomingMessage, ServerResponse } from "node:http";

import {
  getHealth,
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  uploadDocument,
} from "../controllers/document.controllers.js";

import handleNotFound from "../utils/errors.js";

export default function routeHandler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const method = req.method;
  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );
  const pathname = url.pathname;

  // Health check
  if (method === "GET" && pathname === "/api/v1/health") {
    getHealth(req, res);
    return;
  }

  // Create a document
  if (method === "POST" && pathname === "/api/v1/documents") {
    void createDocument(req, res);
    return;
  }

  // Retrieve all documents
  if (method === "GET" && pathname === "/api/v1/documents") {
    void getDocuments(req, res);
    return;
  }

  // Match individual document routes
  const documentMatch = pathname.match(/^\/api\/v1\/documents\/([^/]+)$/);

  if (documentMatch) {
    const id = decodeURIComponent(documentMatch[1] as string);

    if (method === "GET") {
      void getDocumentById(req, res, id);
      return;
    }

    if (method === "PATCH") {
      void updateDocument(req, res, id);
      return;
    }

    if (method === "DELETE") {
      void deleteDocument(req, res, id);
      return;
    }
  }

  // Upload document content
  const uploadMatch = pathname.match(
    /^\/api\/v1\/documents\/([^/]+)\/content$/,
  );

  if (uploadMatch && method === "PUT") {
    const id = decodeURIComponent(uploadMatch[1] as string);

    void uploadDocument(req, res, id);
    return;
  }

  handleNotFound(req, res);
}
