import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { healthRouter, type HealthChecks } from "./routes/health";

// A factory (instead of a global app) lets tests inject fake dependencies.
export function createApp(checks: HealthChecks = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: "100kb" }));
  app.use(pinoHttp({ logger }));

  app.use("/api/v1/health", healthRouter(checks));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
