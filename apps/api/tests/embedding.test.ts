import { describe, expect, it } from "@jest/globals";
import { generateEmbedding } from "../src/modules/ai/embedding.service";

describe("generateEmbedding", () => {
  it("generates a normalized 384-dimensional vector", async () => {
    const vector = await generateEmbedding(
      "Customers can reset their password.",
    );

    expect(vector).toHaveLength(384);
    expect(vector.every(Number.isFinite)).toBe(true);

    const magnitude = Math.sqrt(
      vector.reduce((sum, value) => sum + value * value, 0),
    );

    expect(magnitude).toBeCloseTo(1, 4);
  }, 120_000);
});
