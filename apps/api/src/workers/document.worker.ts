
import { Worker } from "bullmq";
import { connectMongo } from "../db/mongo";
import { createDocumentRedisConnection } from "../modules/documents/document.redis";
import { processDocument } from "../modules/documents/document.processor";

async function startWorker() {
  // The worker is a separate process, so connect independently.
  await connectMongo();

  const worker = new Worker(
    "document-processing",
    async (job) => {
      const { workspaceId, documentId } = job.data;
    console.info("Processing document job:", {
            jobId: job.id,
            workspaceId: job.data.workspaceId,
            documentId: job.data.documentId,
            });
      await processDocument(workspaceId, documentId);
    },
    {
      connection: createDocumentRedisConnection(),
      concurrency: 2,
    },
  );

  worker.on("completed", (job) => {
    console.info(`Document job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(
      `Document job failed: ${job?.id}`,
      error.message,
    );
  });

  const shutdown = async () => {
    await worker.close();
    process.exit(0);
  };

  process.once("SIGTERM", () => void shutdown());
  process.once("SIGINT", () => void shutdown());
}

startWorker().catch((error) => {
  console.error("Failed to start document worker:", error);
  process.exitCode = 1;
});
