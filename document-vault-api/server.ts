import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { env } from "node:process";

const PORT = Number(env.PORT) || 3000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET" && req.url === "/api/v1/health") {
    const response = {
      status: "ok",
      message: "Document Vault API is running",
    };

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(response, null, 2));
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }, null, 2));
  return;
});

server.listen(PORT, () => {
  console.log("Server is running...");
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} already in use`);
    return;
  }

  console.error("Server error: ", err);
});
