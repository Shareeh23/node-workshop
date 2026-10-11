import { createServer  } from "node:http";
import { env } from "node:process";

import routeHandler from "./routes/document.routes.js";

const PORT = Number(env.PORT) || 3000;

const server = createServer(routeHandler);

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
