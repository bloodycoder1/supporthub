
export interface TextChunk {
  content: string;
  index: number;
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 150;

export function splitTextIntoChunks(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP,
): TextChunk[] {
  if (
    !Number.isInteger(chunkSize) ||
    !Number.isInteger(overlap) ||
    chunkSize <= 0 ||
    overlap < 0 ||
    overlap >= chunkSize
  ) {
    throw new Error(
      "Chunk size must be positive, and overlap must be smaller than chunk size",
    );
  }

  const normalizedText = text.trim();

  if (!normalizedText) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < normalizedText.length) {
    let end = Math.min(
      start + chunkSize,
      normalizedText.length,
    );

    // Prefer ending at a word boundary when possible.
    if (end < normalizedText.length) {
      const boundary = normalizedText.lastIndexOf(" ", end);

      if (boundary > start) {
        end = boundary;
      }
    }

    const content = normalizedText
      .slice(start, end)
      .trim();

    if (content) {
      chunks.push({
        content,
        index: chunks.length,
      });
    }

    if (end >= normalizedText.length) {
      break;
    }

    const nextStart = Math.max(0, end - overlap);

    // Safety guard against a non-progressing loop.
    if (nextStart <= start) {
      throw new Error("Unable to advance document chunking");
    }

    start = nextStart;
  }

  return chunks;
}
