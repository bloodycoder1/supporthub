
import request from "supertest";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { createApp } from "../src/app";
import { UserModel } from "../src/modules/auth/auth.model";
import { WorkspaceModel } from "../src/modules/workspaces/workspace.model";

describe("Workspace authorization", () => {
  const app = createApp();

  beforeEach(async () => {
    await WorkspaceModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  async function createUserAndWorkspace(email: string) {
    const registration = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email,
        password: "TestPassword123",
      });

    expect(registration.status).toBe(201);

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password: "TestPassword123",
      });

    expect(login.status).toBe(200);

    const token = login.body.data.accessToken as string;

    const workspaceResponse = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Workspace" });

    expect(workspaceResponse.status).toBe(201);

    return {
      token,
      workspaceId: workspaceResponse.body.data.workspace.id as string,
    };
  }

  it("allows the owner to access their workspace", async () => {
    const user = await createUserAndWorkspace("owner@example.com");

    const response = await request(app)
      .get(`/api/v1/workspaces/${user.workspaceId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.workspace.id).toBe(user.workspaceId);
  });

  it("prevents another user from accessing the workspace", async () => {
    const owner = await createUserAndWorkspace("owner@example.com");
    const otherUser = await createUserAndWorkspace("other@example.com");

    const response = await request(app)
      .get(`/api/v1/workspaces/${owner.workspaceId}`)
      .set("Authorization", `Bearer ${otherUser.token}`);

    expect(response.status).toBe(404);
  });

  it("rejects requests without an authentication token", async () => {
    const response = await request(app)
      .get("/api/v1/workspaces/507f1f77bcf86cd799439011");

    expect(response.status).toBe(401);
  });
});
