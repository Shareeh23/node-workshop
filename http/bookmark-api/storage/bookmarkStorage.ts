import { readFile, writeFile } from "node:fs/promises";
import type { BookMark } from "../types/bookmark.js";

const filePath = new URL("../data.json", import.meta.url);

export async function initStorage() {
  try {
    await readFile(filePath);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await writeFile(filePath, "[]", "utf-8");
      return;
    }
    throw err;
  }
}

export async function readBookmarks() {
  const bookmarks = await readFile(filePath, { encoding: "utf-8" });
  return JSON.parse(bookmarks);
}

export async function readBookmark(id: string): Promise<BookMark | undefined> {
  const bookmarks: BookMark[] = await readBookmarks();
  return bookmarks.find((bookmark) => bookmark.id === id);
}

export async function writeBookmark(bookmark: BookMark) {
  const bookmarks = await readBookmarks();
  bookmarks.push(bookmark);
  await writeFile(filePath, JSON.stringify(bookmarks, null, 2), "utf-8");
}

export async function replaceBookmark(bookmark: BookMark) {
  const bookmarks = await readBookmarks();

  const bookmarkIndex = bookmarks.findIndex(
    (item: BookMark) => item.id === bookmark.id,
  );

  bookmarks[bookmarkIndex] = bookmark;

  await writeFile(filePath, JSON.stringify(bookmarks, null, 2), "utf-8");
}

export async function deleteBookmark(id: string) {
  const bookmarks: BookMark[] = await readBookmarks();

  const filteredBookmarks =  bookmarks.filter((bookmark) => bookmark.id !== id);
  
  if(filteredBookmarks.length === bookmarks.length) {
    return false;
  }

  await writeFile(filePath, JSON.stringify(filteredBookmarks, null, 2), 'utf-8');

  return true;
}
