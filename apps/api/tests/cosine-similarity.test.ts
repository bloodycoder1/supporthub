import { describe, expect, it } from "@jest/globals";
import { cosineSimilarity } from "../src/modules/ai/cosine-similarity";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
  });

  it("returns 0 for perpendicular vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("rejects vectors with different dimensions", () => {
    expect(() => cosineSimilarity([1, 2], [1])).toThrow();
  });
});
