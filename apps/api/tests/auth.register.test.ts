
import request from "supertest";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { createApp } from "../src/app";
import { UserModel } from "../src/modules/auth/auth.model";

describe("POST /api/v1/auth/register", () => {
  const app = createApp();

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "TestPassword123"
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe("test@example.com");
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  it("should reject duplicate email addresses", async () => {
    const payload = {
      name: "Test User",
      email: "test@example.com",
      password: "TestPassword123"
    };

    await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(409);
  });

  it("should reject invalid registration data", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "A",
        email: "invalid-email",
        password: "123"
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
