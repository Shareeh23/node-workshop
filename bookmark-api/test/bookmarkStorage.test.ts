import { readFile, unlink, writeFile } from "node:fs/promises";
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { initStorage, readBookmarks } from "../storage/bookmarkStorage.js";

const filePath = new URL("./data.test.json", import.meta.url);

const testData = [
  {
    id: "356634e4-ccef-4eb4-84e7-ddb39009ba19",
    title: "Acme.org",
    url: "https://acme.org",
    category: "e-commerce",
    createdAt: "2026-10-08T09:15:34.983Z",
  },
];

describe("initStorage()", () => {
  it("creates an empty file if it doesn't exist", async () => {
    try {
      await unlink(filePath);
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }

    await initStorage();
    const bookmarks = await readFile(filePath, "utf-8");
    assert.strictEqual(bookmarks, "[]");
  });

  it("does not overwrite the existing file", async () => {
    await writeFile(filePath, JSON.stringify(testData), "utf-8");
    await initStorage();
    const bookmarks = await readFile(filePath, "utf-8");
    assert.deepStrictEqual(bookmarks, JSON.stringify(testData));
  });
});

describe("readBookmarks()", (t) => {
  beforeEach(async () => {
    await writeFile(filePath, "[]", "utf-8");
  });

  it("reads bookmarks", async () => {
    await writeFile(filePath, JSON.stringify(testData), "utf-8");
    const bookmarks = await readBookmarks();
    assert.deepStrictEqual(bookmarks, testData);
  });

  it("returns empty array when there are no bookmarks", async () => {
    const bookmarks = await readBookmarks();
    assert.deepStrictEqual(bookmarks, []);
  });
});
