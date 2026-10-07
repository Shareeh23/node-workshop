import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { appendFile } from "node:fs/promises";
import { Buffer } from "node:buffer";

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET" && req.url === "/") {
    const response = {
      message: "Bookmark API",
      endpoints: {
        "GET /": "API documentation",
        "GET /bookmarks": "Get all bookmarks",
        "GET /bookmarks/:id": "Get a bookmark by id",
        "POST /bookmarks": "Create a bookmark",
        "PATCH /bookmarks/:id": "Update a bookmark",
        "DELETE /bookmarks/:id": "Delete a bookmark"
      }
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end(JSON.stringify(response, null, 2));
  }

  if (req.method === "POST" && req.url === "/bookmarks") {
    const chunks: Uint8Array<ArrayBufferLike>[] = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", async () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString());

        const data = {
          id: crypto.randomUUID(),
          ...body,
          createdAt: new Date().toISOString(),
        };

        await appendFile("./data.txt", JSON.stringify(data, null, 2) + "\n", "utf-8");

        res.writeHead(200, { "Content-Type": "application/json" });

        const response = {
          message: "Bookmark successfully created",
          data,
        };

        res.end(JSON.stringify(response, null, 2));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Internal server error" }));
      }
    });
  }
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
