import type { BookMark, BookMarkInput } from "../types/bookmark.js";

// TODO: Split buildBookmark() into separate createBookmark() and updateBookmark() service functions.

export function buildBookmark(
  method: "POST" | "PATCH",
  body: BookMarkInput,
  existingBookmark?: BookMark,
): BookMark {
  if (method === "POST") {
    return {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    };
  }

  if (method === "PATCH") {
    return {
      ...existingBookmark!,
      ...body,
    };
  }

  throw new Error(`Unsupported method: ${method}`);
}
