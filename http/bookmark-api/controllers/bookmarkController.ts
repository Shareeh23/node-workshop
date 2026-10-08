import type { IncomingMessage, ServerResponse } from "node:http";
import type { BookMarkInput } from "../types/bookmark.js";

import {
  readBookmark,
  readBookmarks,
  writeBookmark,
  replaceBookmark,
} from "../storage/bookmarkStorage.js";
import { buildBookmark } from "../services/bookmarkService.js";
import { bodyParsing } from "../utils/request.js";

export function getApiDocumentationHandler(
  _req: IncomingMessage,
  res: ServerResponse,
) {
  const response = {
    message: "Bookmark API",
    endpoints: {
      "GET /": "API documentation",
      "GET /bookmarks": "Get all bookmarks",
      "GET /bookmarks/:id": "Get a bookmark by id",
      "POST /bookmarks": "Create a bookmark",
      "PATCH /bookmarks/:id": "Update a bookmark",
      "DELETE /bookmarks/:id": "Delete a bookmark",
    },
  };

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(response, null, 2));
}

export async function getBookmarksHandler(
  _req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const bookmarks = await readBookmarks();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(bookmarks, null, 2));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        {
          message: "Failed to retrieve bookmarks",
        },
        null,
        2,
      ),
    );
  }
}

export async function getBookmarkHandler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const url = new URL(req.url as string, `http://${req.headers.host}`);

    const id = url.pathname.split("/")[2];

    const bookmark = await readBookmark(id);

    if (!bookmark) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            message: "Bookmark doesn't exist",
          },
          null,
          2,
        ),
      );
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(bookmark, null, 2));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        {
          message: "Failed to retrieve bookmarks",
        },
        null,
        2,
      ),
    );
  }
}

export async function createBookmarkHandler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const chunks: Uint8Array<ArrayBufferLike>[] = [];

  req.on("data", (chunk) => {
    chunks.push(chunk);
  });

  req.on("end", async () => {
    try {
      const body = bodyParsing(chunks);

      const data = buildBookmark("POST", body);

      await writeBookmark(data);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            message: "Bookmark successfully created",
            data,
          },
          null,
          2,
        ),
      );
    } catch (err) {
      if (err instanceof SyntaxError) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify(
            {
              message: "Invalid JSON",
            },
            null,
            2,
          ),
        );
        return;
      }
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            message: "Internal server error",
          },
          null,
          2,
        ),
      );
    }
  });
}

export async function updateBookmarkHandler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const url = new URL(req.url as string, `http://${req.headers.host}`);

  const chunks: Uint8Array<ArrayBufferLike>[] = [];

  req.on("data", (chunk) => {
    chunks.push(chunk);
  });

  req.on("end", async () => {
    try {
      const id = url.pathname.split("/")[2];

      const bookmark = await readBookmark(id);

      if (!bookmark) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Bookmark doesn't exist",
          }),
        );

        return;
      }

      const body: BookMarkInput = bodyParsing(chunks);

      const data = buildBookmark("PATCH", body, bookmark);

      await replaceBookmark(data);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            message: "Bookmark updated successfully",
            data,
          },
          null,
          2,
        ),
      );
    } catch (err) {
      if (err instanceof SyntaxError) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify(
            {
              message: "Invalid JSON",
            },
            null,
            2,
          ),
        );
        return;
      }
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            message: "Internal server error",
          },
          null,
          2,
        ),
      );
    }
  });
}
