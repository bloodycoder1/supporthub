import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../config/logger";

// BullMQ (Milestone 3) needs maxRetriesPerRequest: null on its own connections;
// this shared client is for caching and rate limiting.
export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

redis.on("error", (err) => logger.error({ err: err.message }, "Redis error"));

export async function connectRedis(): Promise<void> {
  await redis.connect();
  logger.info("Redis connected");
}

export async function pingRedis(): Promise<void> {
  const reply = await redis.ping();
  if (reply !== "PONG") throw new Error("Unexpected Redis reply");
}
