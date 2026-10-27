
export function cosineSimilarity(
  a: number[],
  b: number[],
): number {
  if (a.length === 0 || a.length !== b.length) {
    throw new Error("Vectors must have the same non-zero dimensions");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

 for (let i = 0; i < a.length; i++) {
  const valueA = a[i];
  const valueB = b[i];

  if (valueA === undefined || valueB === undefined) {
    throw new Error("Vector contains a missing element");
  }

  dotProduct += valueA * valueB;
  magnitudeA += valueA * valueA;
  magnitudeB += valueB * valueB;
}

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Cannot compare a zero-magnitude vector");
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}
