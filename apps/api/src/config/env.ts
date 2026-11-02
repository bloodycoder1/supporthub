import { z } from "zod";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// Validate configuration once at startup so the app fails fast on bad config.
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/supporthub"),
  REDIS_URL: z.string().min(1).default("redis://127.0.0.1:6379"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  JWT_SECRET: z.string().min(32),
  HF_TOKEN: z.string().optional(),
  HF_MODEL: z.string().default("Qwen/Qwen2.5-7B-Instruct"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Print only field names and messages, never values (they may be secrets).
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
