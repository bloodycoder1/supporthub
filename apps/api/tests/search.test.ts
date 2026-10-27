import request from "supertest";
import mongoose from "mongoose";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { createApp } from "../src/app";
import { UserModel } from "../src/modules/auth/auth.model";
import { WorkspaceModel } from "../src/modules/workspaces/workspace.model";
import { DocumentChunkModel } from "../src/modules/documents/document-chunk.model";
import * as embeddingService from "../src/modules/ai/embedding.service";

describe("Search API", () => {
  const app = createApp();

  beforeEach(async () => {
    await DocumentChunkModel.deleteMany({});
    await WorkspaceModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  async function createUserAndWorkspace() {
    const registration = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email: "searchtest@example.com",
        password: "TestPassword123",
      });

    expect(registration.status).toBe(201);

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "searchtest@example.com",
        password: "TestPassword123",
      });

    const token = login.body.data.accessToken as string;

    const workspaceResponse = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Knowledge Base" });

    const workspaceId = workspaceResponse.body.data.workspace.id as string;

    return { token, workspaceId };
  }

  it("requires authentication", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/v1/workspaces/${fakeId}/search?q=test`);
    expect(res.status).toBe(401);
  });

  it("rejects search when query parameter is missing", async () => {
    const { token, workspaceId } = await createUserAndWorkspace();

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/search`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("search query is required");
  });

  it("returns 404 for a non-existent workspace", async () => {
    const { token } = await createUserAndWorkspace();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/v1/workspaces/${fakeId}/search?q=pricing`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns ranked search results using semantic similarity", async () => {
    const { token, workspaceId } = await createUserAndWorkspace();
    const documentId = new mongoose.Types.ObjectId();

    // Mock embedding generation to return predictable 3-dimensional vectors
    jest.spyOn(embeddingService, "generateEmbedding").mockImplementation(async (text: string) => {
      if (text.includes("pricing")) {
        return [1, 0, 0];
      }
      return [0, 1, 0];
    });

    // Seed two chunks: one aligned with query [1, 0, 0], one orthogonal [0, 1, 0]
    await DocumentChunkModel.create([
      {
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        documentId,
        content: "Our enterprise plan pricing is $99/mo.",
        index: 0,
        embedding: [1, 0, 0],
      },
      {
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        documentId,
        content: "To reset your password, click here.",
        index: 1,
        embedding: [0, 1, 0],
      },
    ]);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/search?q=pricing&limit=5`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results).toHaveLength(2);
    expect(res.body.data.results[0].content).toContain("pricing");
    expect(res.body.data.results[0].score).toBeCloseTo(1);
    expect(res.body.data.results[1].score).toBeCloseTo(0);

    jest.restoreAllMocks();
  });
});
