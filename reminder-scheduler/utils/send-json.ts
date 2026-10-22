import type { ServerResponse } from "node:http";

export default function sendJSON(
  res: ServerResponse,
  statusCode: number,
  data: unknown,
  message: string,
) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify(
      {
        data,
        message,
      },
      null,
      2,
    ),
  );
}
