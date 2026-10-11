import type { IncomingMessage, ServerResponse } from "node:http";

export default function handleNotFound(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }, null, 2));
  return;
}
