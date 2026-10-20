import { bodyParsing } from "../utils/request.js";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("bodyParsing()", () => {
  it("parses valid JSON", () => {
    const chunks = [Buffer.from('{"name":'), Buffer.from('"Acme.org"}')];
    assert.deepStrictEqual(bodyParsing(chunks), { name: "Acme.org" });
  });

  it("parses JSON with multiple properties", () => {
    const chunks = [
      Buffer.from('{"name":'),
      Buffer.from('"Acme.org",'),
      Buffer.from('"category":'),
      Buffer.from('"e-commerce"}'),
    ];
    assert.deepStrictEqual(bodyParsing(chunks), {
      name: "Acme.org",
      category: "e-commerce",
    });
  });

  it("throws for invalid JSON", () => {
    const chunks = [Buffer.from('{"name":')];
    assert.throws(() => bodyParsing(chunks));
  });
});
