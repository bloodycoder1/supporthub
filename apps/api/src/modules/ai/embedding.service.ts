
import { pipeline } from "@huggingface/transformers";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

type EmbeddingPipeline = Awaited<
  ReturnType<typeof pipeline<"feature-extraction">>
>;

let embeddingPipeline: EmbeddingPipeline | undefined;
let loadingPipeline: Promise<EmbeddingPipeline> | undefined;

async function getEmbeddingPipeline(): Promise<EmbeddingPipeline> {
  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  if (!loadingPipeline) {
    loadingPipeline = pipeline("feature-extraction", MODEL_ID)
      .catch((error: unknown) => {
        loadingPipeline = undefined;
        throw error;
      });
  }

  embeddingPipeline = await loadingPipeline;
  return embeddingPipeline;
}

export async function generateEmbedding(
  text: string,
): Promise<number[]> {
  const normalizedText = text.trim();

  if (!normalizedText) {
    throw new Error("Cannot generate an embedding for empty text");
  }

  const extractor = await getEmbeddingPipeline();

  const output = await extractor(normalizedText, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data as Float32Array);
}
