import { IncomingMessage, ServerResponse } from "node:http";

import { getHealth } from "../controllers/document.controllers.js";
import handleNotFound from "../utils/errors.js";

export default function routeHandler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "GET" && req.url === "/api/v1/health") {
    getHealth(req, res);
    return;
  }

  handleNotFound(req, res);
}
