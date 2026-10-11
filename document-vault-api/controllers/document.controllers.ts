import { IncomingMessage, ServerResponse } from "node:http";

export function getHealth(req: IncomingMessage, res: ServerResponse) {
  const response = {
      status: "ok",
      message: "Document Vault API is running",
    };

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(response, null, 2));
}