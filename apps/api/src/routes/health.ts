import { Router } from "express";

export type HealthCheck = () => Promise<void>;
export type HealthChecks = Record<string, HealthCheck>;

export function healthRouter(checks: HealthChecks): Router {
  const router = Router();

  // Liveness: is the process up? Used by Docker/load balancers.
  router.get("/", (_req, res) => {
    res.json({ status: "ok", uptime: Math.round(process.uptime()) });
  });

  // Readiness: can the app reach its dependencies?
  router.get("/ready", async (_req, res) => {
    const results: Record<string, "up" | "down"> = {};
    await Promise.all(
      Object.entries(checks).map(async ([name, check]) => {
        try {
          await check();
          results[name] = "up";
        } catch {
          results[name] = "down";
        }
      }),
    );
    const ready = Object.values(results).every((s) => s === "up");
    res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "degraded", checks: results });
  });

  return router;
}
