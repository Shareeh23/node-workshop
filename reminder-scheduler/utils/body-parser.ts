import type { IncomingMessage } from "node:http";

export default async function bodyParser(
  req: IncomingMessage,
): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks).toString("utf-8");

  if (!body.trim()) {
    throw new Error("EMPTY_BODY");
  }

  return JSON.parse(body);
}
