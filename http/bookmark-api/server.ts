import { createServer } from "node:http";
import { initStorage } from "./storage/bookmarkStorage.js";
import { handleBookmarkRoutes } from "./routes/bookmarkRoutes.js";

const server = createServer(handleBookmarkRoutes);

server.listen(3000, async () => {
  await initStorage();
  console.log("Server running on port 3000");
});
