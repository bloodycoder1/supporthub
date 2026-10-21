
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { documentUploadLimits } from "./document.validation";

const uploadDirectory = path.resolve(
  process.cwd(),
  "private_uploads",
);

export async function extractDocumentText(
  storageKey: string,
  mimeType: string,
): Promise<string> {
  if (
    !storageKey ||
    path.basename(storageKey) !== storageKey
  ) {
    throw new Error("Invalid document storage key");
  }

  const allowedMimeTypes = documentUploadLimits.allowedMimeTypes;

  if (!(allowedMimeTypes as readonly string[]).includes(mimeType)) {
    throw new Error("Unsupported document type");
  }

  const filePath = path.join(uploadDirectory, storageKey);
  const buffer = await readFile(filePath);

  if (buffer.length === 0) {
    throw new Error("Document is empty");
  }

  if (buffer.length > documentUploadLimits.maxFileSizeBytes) {
    throw new Error("Document exceeds the 5 MB limit");
  }

  let extractedText: string;

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      extractedText = result.text;
    } finally {
      await parser.destroy();
    }
  } else {
    if (buffer.includes(0)) {
      throw new Error("File does not contain valid plain text");
    }

    extractedText = new TextDecoder("utf-8", {
      fatal: true,
    }).decode(buffer);
  }

  const normalizedText = extractedText
    .replace(/\r\n?/g, "\n")
    .trim();

  if (!normalizedText) {
    throw new Error("Document contains no readable text");
  }

  return normalizedText;
}
