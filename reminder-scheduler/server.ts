import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { env } from "node:process";

const PORT = Number(env.PORT) || 3000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify(
        {
          status: "ok",
          message: "server is running",
        },
        null,
        2,
      ),
    );

    return;
  }

  res.writeHead(404, {
    "Content-Type": "application/json",
  });
  res.end(
    JSON.stringify(
      {
        error: {
          code: "NOT_FOUND",
          message: "The requested resource was not found",
        },
      },
      null,
      2,
    ),
  );
});

server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
