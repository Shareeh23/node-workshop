import type { IncomingMessage, ServerResponse } from "node:http";

import {
  getApiDocumentationHandler,
  getBookmarksHandler,
  getBookmarkHandler,
  createBookmarkHandler,
  updateBookmarkHandler,
} from "../controllers/bookmarkController.js";

export function handleBookmarkRoutes(
  req: IncomingMessage,
  res: ServerResponse,
) {
  if (req.method === "GET" && req.url === "/") {
    return getApiDocumentationHandler(req, res);
  }

  if (req.method === "GET" && req.url === "/bookmarks") {
    return getBookmarksHandler(req, res);
  }

  if (req.method === "GET" && req.url?.startsWith("/bookmarks/")) {
    return getBookmarkHandler(req, res);
  }

  if (req.method === "POST" && req.url === "/bookmarks") {
    return createBookmarkHandler(req, res);
  }

  if (req.method === "PATCH" && req.url?.startsWith("/bookmarks/")) {
    return updateBookmarkHandler(req, res);
  }
}
