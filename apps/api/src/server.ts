import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectMongo, disconnectMongo, pingMongo } from "./db/mongo";
import { connectRedis, pingRedis, redis } from "./db/redis";

async function main() {
  await connectMongo();
  await connectRedis();

  const app = createApp({ mongo: pingMongo, redis: pingRedis });
  const server = app.listen(env.PORT, () => logger.info(`API listening on port ${env.PORT}`));

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectMongo();
      redis.disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.fatal({ err: err instanceof Error ? err.message : err }, "Failed to start");
  process.exit(1);
});
