
import { describe, expect, it } from "@jest/globals";
import { splitTextIntoChunks } from "../src/modules/documents/document.chunker";

describe("splitTextIntoChunks", () => {
  it("returns no chunks for empty text", () => {
    expect(splitTextIntoChunks("   ")).toEqual([]);
  });

  it("splits long text into indexed chunks", () => {
    const text = "word ".repeat(500);

    const chunks = splitTextIntoChunks(text, 500, 50);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.index).toBe(0);
    expect(chunks[1]?.index).toBe(1);
    expect(chunks.every((chunk) => chunk.content.length > 0))
      .toBe(true);
  });

  it("rejects invalid overlap", () => {
    expect(() => splitTextIntoChunks("hello", 100, 100))
      .toThrow();
  });
});
