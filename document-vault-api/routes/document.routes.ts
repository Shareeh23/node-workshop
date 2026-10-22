import type { IncomingMessage, ServerResponse } from "node:http";

import {
  getHealth,
  createDocument,
  getDocuments,
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

  handleNotFound(req, res);
}
