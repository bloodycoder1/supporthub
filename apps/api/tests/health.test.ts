import request from "supertest";
import { createApp } from "../src/app";

describe("health endpoints", () => {
  it("GET /api/v1/health returns ok", async () => {
    const res = await request(createApp()).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /ready returns 200 when all dependencies are up", async () => {
    const app = createApp({ mongo: async () => {}, redis: async () => {} });
    const res = await request(app).get("/api/v1/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.checks).toEqual({ mongo: "up", redis: "up" });
  });

  it("GET /ready returns 503 when a dependency is down", async () => {
    const app = createApp({
      mongo: async () => {},
      redis: async () => {
        throw new Error("down");
      },
    });
    const res = await request(app).get("/api/v1/health/ready");
    expect(res.status).toBe(503);
    expect(res.body.checks.redis).toBe("down");
  });
});

describe("error handling", () => {
  it("returns a consistent 404 shape for unknown routes", async () => {
    const res = await request(createApp()).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });

  it("sets security headers and hides x-powered-by", async () => {
    const res = await request(createApp()).get("/api/v1/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });
});
