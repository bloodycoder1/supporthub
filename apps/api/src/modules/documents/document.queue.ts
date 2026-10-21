
import { Queue } from "bullmq";
import { createDocumentRedisConnection } from "./document.redis";

export interface DocumentProcessingJob {
  workspaceId: string;
  documentId: string;
}

let documentQueue: Queue<DocumentProcessingJob> | undefined;

export async function getDocumentQueue() {
  if (!documentQueue) {
    documentQueue = new Queue<DocumentProcessingJob>(
      "document-processing",
      {
        connection: createDocumentRedisConnection(),
      },
    );

    await documentQueue.waitUntilReady();
    console.info("Document queue is ready");
  }

  return documentQueue;
}
