import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { env } from "node:process";
import { routeHandler } from "./routes/reminder.routes.js";

const PORT = Number(env.PORT) || 3000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  routeHandler(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
