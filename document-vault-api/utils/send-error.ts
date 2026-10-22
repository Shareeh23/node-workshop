import type { ServerResponse } from "node:http";

export default function sendError(
  res: ServerResponse,
  statusCode: number,
  code: string,
  message: string,
) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify(
      {
        error: {
          code,
          message,
        },
      },
      null,
      2,
    ),
  );
}