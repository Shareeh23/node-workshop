import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { URL } from "node:url";
import { Buffer } from "node:buffer";

type BookMark = {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
};

type BookMarkInput = {
  title: string;
  url: string;
  category: string;
};

const filePath = new URL("./data.json", import.meta.url);

async function initStorage() {
  try {
    await readFile(filePath);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await writeFile(filePath, "[]", "utf-8");
      return;
    }
    throw err;
  }
}

export async function readBookmarks() {
  const contents = await readFile(filePath, { encoding: "utf-8" });
  return JSON.parse(contents);
}

export async function readBookmark(id: string): Promise<BookMark | undefined> {
  const bookmarks: BookMark[] = await readBookmarks();
  return bookmarks.find((bookmark) => bookmark.id === id);
}

export async function writeBookmark(bookmark: BookMark) {
  const bookmarks = await readBookmarks();
  bookmarks.push(bookmark);
  await writeFile(filePath, JSON.stringify(bookmarks, null, 2), "utf-8");
}

export function bodyParsing(chunks: Uint8Array<ArrayBufferLike>[]) {
  return JSON.parse(Buffer.concat(chunks).toString());
}

export function buildBookmark(
  method: "POST" | "PATCH",
  body: BookMarkInput,
  existingBookmark?: BookMark,
): BookMark {
  if (method === "POST") {
    return {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    };
  }

  if (method === "PATCH") {
    return {
      ...existingBookmark!,
      ...body,
    };
  }

  throw new Error(`Unsupported method: ${method}`);
}

export async function updateBookmark(bookmark: BookMark) {
  const bookmarks = await readBookmarks();

  const bookmarkIndex = bookmarks.findIndex(
    (item: BookMark) => item.id === bookmark.id,
  );

  bookmarks[bookmarkIndex] = bookmark;

  await writeFile(filePath, JSON.stringify(bookmarks, null, 2), "utf-8");
}

const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET" && req.url === "/") {
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

    if (req.method === "GET" && req.url === "/bookmarks") {
      try {
        const bookmarks = await readBookmarks();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(bookmarks, null, 2));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Failed to retrieve bookmarks",
          }),
        );
      }
    }

    if (req.method === "POST" && req.url === "/bookmarks") {
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
              JSON.stringify({
                message: "Invalid JSON",
              }),
            );
            return;
          }
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Internal server error",
            }),
          );
        }
      });
    }

    if (req.method === "PATCH" && req.url?.startsWith("/bookmarks/")) {
      const url = new URL(req.url, `http://${req.headers.host}`);

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

          await updateBookmark(data);

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
              JSON.stringify({
                message: "Invalid JSON",
              }),
            );
            return;
          }
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Internal server error",
            }),
          );
        }
      });
    }
  },
);

server.listen(3000, async () => {
  await initStorage();
  console.log("Server running on port 3000");
});
