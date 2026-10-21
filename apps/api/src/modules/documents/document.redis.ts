
import Redis from "ioredis";
import { env } from "./../../config/env";
import { logger } from "../../config/logger";

export function createDocumentRedisConnection(): Redis {
  const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  connection.on("error", (err) => {
    logger.error(
      { err: err.message },
      "Document queue Redis error",
    );
  });

  return connection;
}
