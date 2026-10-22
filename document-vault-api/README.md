# Document Vault API

A document-management REST API built with **Node.js and TypeScript**, using Node.js's built-in modules instead of Express or another web framework.

The API lets clients create and manage document metadata, upload files, download stored files, and delete documents along with their associated files. The project focuses on HTTP handling, asynchronous filesystem operations, streams, and backend development.

## Features

- Create document records with generated IDs and timestamps.
- Retrieve all documents or retrieve a single document by ID.
- Update document metadata.
- Upload files using raw binary request bodies.
- Download stored files using readable streams.
- Delete document metadata and its associated file, if present.
- Validate request bodies, filenames, MIME types, and file sizes.
- Return consistent JSON error responses.
- Persist metadata in a JSON file and file contents in the local filesystem.

## Tech Stack

- **Node.js** — JavaScript runtime and built-in HTTP server.
- **TypeScript** — Static typing.
- **`node:http`** — HTTP requests, responses, and routing.
- **`node:fs` / `node:fs/promises`** — Filesystem operations.
- **`node:stream`** — Stream-based file uploads and downloads.
- **`node:path`** — Filesystem path handling.
- **`node:crypto`** — Unique document IDs.
- **JSON files** — Document metadata storage.
- **Local filesystem** — Uploaded file storage.
- **`tsx`** — Running TypeScript during development.

## Requirements

- Node.js
- npm

## Getting Started

Clone the repository and install its dependencies:

```bash
git clone <repository-url>
cd document-vault-api
npm install
```

Start the development server using the script configured in `package.json`. For example:

```bash
npm run dev
```

The API's base URL is:

```text
http://localhost:3000/api/v1
```

Ensure the metadata storage file and document storage directory exist at the paths configured by the application.

## API Reference

All endpoints use the `/api/v1` prefix. Responses are JSON unless an endpoint returns file content.

### 1. Health Check

**`GET /health`**

Checks whether the API server is running.

### 2. Create a Document

**`POST /documents`**

Request header:

```http
Content-Type: application/json
```

Request body:

```json
{
  "name": "Node.js Notes",
  "description": "Notes about Node.js core modules",
  "tags": ["nodejs", "backend", "learning"]
}
```

The server generates the document ID and timestamps. File metadata is initially `null`.

**Success response:** `201 Created`

### 3. Retrieve All Documents

**`GET /documents`**

Returns the stored document metadata records.

**Success response:** `200 OK`

### 4. Retrieve a Document by ID

**`GET /documents/:id`**

Returns the metadata for the specified document.

**Success response:** `200 OK`

**Error response:** `404 Not Found`

### 5. Update Document Metadata

**`PATCH /documents/:id`**

Request header:

```http
Content-Type: application/json
```

Request body:

```json
{
  "name": "Updated Node.js Notes",
  "description": "Updated notes about Node.js",
  "tags": ["nodejs", "backend"]
}
```

Only the supplied supported fields are updated.

**Success response:** `200 OK`

### 6. Upload a Document File

**`PUT /documents/:id/content`**

Request headers:

```http
Content-Type: application/pdf
X-File-Name: node-notes.pdf
```

Send the file's **raw binary contents** as the request body. This API does not use `multipart/form-data`.

Example using `curl`:

```bash
curl -X PUT "http://localhost:3000/api/v1/documents/YOUR_DOCUMENT_ID/content" \
  -H "Content-Type: application/pdf" \
  -H "X-File-Name: node-notes.pdf" \
  --data-binary "@node-notes.pdf"
```

The document record must exist before its content can be uploaded. The server streams the request body to disk and records the uploaded filename, MIME type, and file size in the document metadata.

Supported MIME types:

- `application/pdf`
- `text/plain`
- `image/jpeg`
- `image/png`

The maximum upload size is **10 MB**.

**Success response:** `200 OK`

### 7. Download a Document File

**`GET /documents/:id/content`**

Downloads the file associated with a document.

Example using `curl`:

```bash
curl -OJ "http://localhost:3000/api/v1/documents/YOUR_DOCUMENT_ID/content"
```

The server streams the stored file to the client and sends headers describing the content type, file size, and download filename.

A document must have uploaded content to download.

**Success response:** `200 OK`

**Error responses:**

- `404 Not Found` — The document or its associated file does not exist.
- `500 Internal Server Error` — An unexpected server-side error occurs.

### 8. Delete a Document

**`DELETE /documents/:id`**

Deletes the document's metadata and its associated file, if present.

If the document does not exist, the API returns `404 Not Found`.

**Success response:** `204 No Content`

A successful deletion returns no response body.

## Document Metadata

A document record contains the following fields:

| Field              | Type             | Description                                        |
| ------------------ | ---------------- | -------------------------------------------------- |
| `id`               | `string`         | Unique document identifier generated by the server |
| `name`             | `string`         | Display name                                       |
| `description`      | `string`         | Document description                               |
| `tags`             | `string[]`       | Tags associated with the document                  |
| `originalFileName` | `string \| null` | Original uploaded filename                         |
| `mimeType`         | `string \| null` | Uploaded file's MIME type                          |
| `size`             | `number \| null` | File size in bytes                                 |
| `createdAt`        | `string`         | Creation timestamp in ISO 8601 format              |
| `updatedAt`        | `string`         | Last metadata update timestamp in ISO 8601 format  |

Metadata is stored separately from file content. Stored filenames are generated from document IDs rather than using the original uploaded filename as a filesystem path.

## Error Responses

Errors use a consistent JSON structure:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Document not found"
  }
}
```

### HTTP Status Codes

| Status                       | Meaning                                            |
| ---------------------------- | -------------------------------------------------- |
| `200 OK`                     | Request succeeded                                  |
| `201 Created`                | A document record was created                      |
| `204 No Content`             | A document was deleted successfully                |
| `400 Bad Request`            | The request body or supplied fields are invalid    |
| `404 Not Found`              | The document or its uploaded content was not found |
| `413 Content Too Large`      | The upload exceeds the configured size limit       |
| `415 Unsupported Media Type` | The upload uses an unsupported MIME type           |
| `500 Internal Server Error`  | An unexpected server-side error occurred           |

## Project Structure

## Project Structure

```text
document-vault-api/
├── controllers/
│   └── document.controllers.ts
├── routes/
│   └── document.routes.ts
├── services/
│   └── document.services.ts
├── types/
│   └── document.types.ts
├── utils/
│   ├── body-parser.ts
│   ├── errors.ts
│   ├── send-error.ts
│   └── send-json.ts
├── storage/
│   ├── metadata.json
│   └── documents/
├── package.json
├── tsconfig.json
└── README.md
```

- **Routes** match HTTP methods and URL paths to controllers.
- **Controllers** validate requests and construct HTTP responses.
- **Services** implement document and filesystem operations.
- **Utilities** provide shared request-body parsing and response helpers. The `errors.ts` utility handles requests to routes that do not exist.
- **Storage** contains `metadata.json`, which stores document metadata, and the `documents/` directory, which holds uploaded files.

## Future Work

### 1. Search and Filtering

- Search documents by name.
- Filter documents by MIME type.
- Filter documents by creation date.
- Allow search and filtering criteria to be combined.

### 2. Testing

- Add unit and integration tests using Node.js's built-in test runner.
- Test all implemented endpoints.
- Test invalid request bodies and validation errors.
- Test missing documents and files.
- Test file uploads and downloads.
- Test error handling and filesystem failures.

### 3. Testing Utility

- Create a reusable utility to simplify API requests during testing.
- Reduce repetitive setup when testing different endpoints.
- Make it easier to verify response status codes, headers, and bodies.

### 4. Reliability Improvements

- Test interrupted uploads and filesystem failures.
- Improve consistency when metadata writes or file operations fail.
- Verify that concurrent metadata updates do not overwrite one another.

### 5. Additional Node.js Practice

- Inspect storage usage and file sizes.
- Copy files using streams.
- Display system and process information.
- Explore additional Node.js utilities independently of the core API.

## Learning Goals

This project provides practical experience with:

- Building a REST API using Node.js's built-in `http` module.
- Working with HTTP methods, status codes, headers, and request bodies.
- Separating routing, controller, and service responsibilities.
- Parsing and validating JSON request bodies.
- Performing asynchronous filesystem operations.
- Uploading and downloading files with streams.
- Handling common request and filesystem errors.
- Using TypeScript in a backend application without an external web framework.
