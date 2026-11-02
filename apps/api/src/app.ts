import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { healthRouter, type HealthChecks } from "./routes/health";
import authRouter from "./modules/auth/auth.routes";
import protectedAuthRouter from "./modules/auth/auth.protected.routes";
import workspaceRouter from "./modules/workspaces/workspace.routes";
import documentRouter from "./modules/documents/document.routes";
import { searchRouter } from "./modules/ai/search.routes";
import { chatRouter } from "./modules/ai/chat.routes";
import { conversationRouter } from "./modules/chat/conversation.routes";

// A factory (instead of a global app) lets tests inject fake dependencies.
export function createApp(checks: HealthChecks = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: "100kb" }));
  app.use(pinoHttp({ logger }));
  app.use("/api/v1/health", healthRouter(checks));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/auth", protectedAuthRouter);
  app.use("/api/v1/workspaces", workspaceRouter);

  app.use("/api/v1/workspaces/:workspaceId/documents", documentRouter);
  app.use(
  "/api/v1/workspaces/:workspaceId/search",searchRouter,);

  app.use("/api/v1/workspaces/:workspaceId/chat", chatRouter,);
  app.use("/api/v1/workspaces/:workspaceId/conversations", conversationRouter,);

  
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
