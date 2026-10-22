import type { IncomingMessage } from "node:http";

export default function bodyParser(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf-8");
    });

    req.on("end", () => {
      if (!body.trim()) {
        reject(new Error("EMPTY_BODY"));
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}
