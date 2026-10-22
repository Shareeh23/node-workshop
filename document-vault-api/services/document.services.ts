import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import type { Document, CreateDocumentInput } from "../types/document.types.js";

const STORAGE_PATH = resolve(
  import.meta.dirname,
  "../storage/metadata.json",
);
const FILES_PATH = resolve(import.meta.dirname, "../storage/metadata.json");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/png",
]);

async function readDocuments(): Promise<Document[]> {
  const content = await readFile(STORAGE_PATH, "utf-8");

  return JSON.parse(content) as Document[];
}

async function writeDocuments(documents: Document[]): Promise<void> {
  await writeFile(STORAGE_PATH, JSON.stringify(documents, null, 2), "utf-8");
}

export async function createDocument(
  input: CreateDocumentInput,
): Promise<Document> {
  const documents = await readDocuments();
  const now = new Date().toISOString();

  const document: Document = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    tags: input.tags,
    originalFileName: null,
    mimeType: null,
    size: null,
    createdAt: now,
    updatedAt: now,
  };

  documents.push(document);

  await writeDocuments(documents);

  return document;
}

export async function getDocuments(): Promise<Document[]> {
  return readDocuments();
}

export async function getDocumentById(
  id: string,
): Promise<Document | undefined> {
  const documents = await readDocuments();

  return documents.find((document) => document.id === id);
}

export async function updateDocument(
  id: string,
  updates: Partial<CreateDocumentInput>,
): Promise<Document | undefined> {
  const documents = await readDocuments();

  const document = documents.find((item) => item.id === id);

  if (!document) {
    return undefined;
  }

  if (updates.name !== undefined) {
    document.name = updates.name;
  }

  if (updates.description !== undefined) {
    document.description = updates.description;
  }

  if (updates.tags !== undefined) {
    document.tags = updates.tags;
  }

  document.updatedAt = new Date().toISOString();

  await writeDocuments(documents);

  return document;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const documents = await readDocuments();

  const index = documents.findIndex((document) => document.id === id);

  if (index === -1) {
    return false;
  }

  const document = documents[index];

  const filePath = resolve(FILES_PATH, `${document!.id}.upload`);

  await rm(filePath, { force: true });

  documents.splice(index, 1);

  await writeDocuments(documents);

  return true;
}

export async function uploadDocument(
  id: string,
  originalFileName: string,
  mimeType: string,
  body: Readable,
): Promise<Document | undefined> {
  const documents = await readDocuments();
  const document = documents.find((item) => item.id === id);

  if (!document) {
    return undefined;
  }

  if (!originalFileName.trim()) {
    throw new Error("INVALID_FILENAME");
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  await mkdir(FILES_PATH, { recursive: true });

  const destination = resolve(FILES_PATH, `${id}.upload`);
  const temporaryPath = `${destination}.tmp`;

  let size = 0;

  async function* limitedBody() {
    for await (const chunk of body) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

      size += buffer.length;

      if (size > MAX_FILE_SIZE) {
        throw new Error("FILE_TOO_LARGE");
      }

      yield buffer;
    }
  }

  try {
    await pipeline(
      Readable.from(limitedBody()),
      createWriteStream(temporaryPath, { flags: "w" }),
    );

    await rename(temporaryPath, destination);

    document.originalFileName = originalFileName;
    document.mimeType = mimeType;
    document.size = size;
    document.updatedAt = new Date().toISOString();

    await writeDocuments(documents);

    return document;
  } catch (err) {
    await rm(temporaryPath, { force: true }).catch(() => {});
    throw err;
  }
}
