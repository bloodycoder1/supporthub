
import request from "supertest";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { createApp } from "../src/app";
import { UserModel } from "../src/modules/auth/auth.model";

describe("POST /api/v1/auth/login", () => {
  const app = createApp();

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it("should login with valid credentials", async () => {
    const credentials = {
      name: "Test User",
      email: "login@example.com",
      password: "TestPassword123",
    };

    await request(app)
      .post("/api/v1/auth/register")
      .send(credentials);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: credentials.email,
        password: credentials.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.tokenType).toBe("Bearer");
  });

  it("should reject an incorrect password", async () => {
    const credentials = {
      name: "Test User",
      email: "login@example.com",
      password: "TestPassword123",
    };

    await request(app)
      .post("/api/v1/auth/register")
      .send(credentials);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: credentials.email,
        password: "WrongPassword123",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject an unknown email", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "unknown@example.com",
        password: "TestPassword123",
      });

    expect(response.status).toBe(401);
  });
});
