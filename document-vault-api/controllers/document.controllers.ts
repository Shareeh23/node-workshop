import { IncomingMessage, ServerResponse } from "node:http";

import { bodyParsing } from "../utils/bodyParser.js";

export function getHealth(req: IncomingMessage, res: ServerResponse) {
  const response = {
    status: "ok",
    message: "Document Vault API is running",
  };

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(response, null, 2));
}

// export function getDocuments(req: IncomingMessage, res: ServerResponse) {
//   const response = {
//     data: "",
//     message: "",
//   };

//   res.writeHead(200, { "content-type": "application/json" });
//   res.end(JSON.stringify(response, null, 2));
// }

export function createDocument(req: IncomingMessage, res: ServerResponse) {
  const chunks: Uint8Array<ArrayBufferLike>[] = [];

  req.on("data", (chunk) => {
    chunks.push(chunk);
  });

  req.on("error", (err) => {
    console.error("Request stream error: ", err);

    if (res.headersSent || res.destroyed) {
      res.destroy();
      return;
    }

    res.writeHead(500, { "content-type": "application/json" });
    res.end(
      JSON.stringify(
        {
          error: true,
          message: "internal server error",
        },
        null,
        2,
      ),
    );
    return;
  });

  req.on("end", () => {
    try {
      const body = bodyParsing(chunks);
      console.log(body);
      // write body to the json file

      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify(
          {
            success: true,
            message: "Document received",
          },
          null,
          2,
        ),
      );
    } catch (err) {
      if (err instanceof SyntaxError) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(
          JSON.stringify(
            {
              error: true,
              message: "Request body is malformed",
            },
            null,
            2,
          ),
        );
        return;
      }

      res.writeHead(500, { "content-type": "application/json" });
      res.end(
        JSON.stringify(
          {
            error: true,
            message: "Internal server error",
          },
          null,
          2,
        ),
      );
    }
  });
}
