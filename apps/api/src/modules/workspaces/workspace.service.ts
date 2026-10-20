import { WorkspaceModel } from "./workspace.model";
import type { CreateWorkspaceInput } from "./workspace.validation";


// import { WorkspaceModel } from "./workspace.model.js";

// Keep your existing createWorkspace function.


import mongoose from "mongoose";

// Keep your existing createWorkspace and getUserWorkspaces functions.
export async function getWorkspaceById(
  workspaceId: string,
  ownerId: string
) {
  if (!mongoose.isValidObjectId(workspaceId)) {
    return null;
  }

  const workspace = await WorkspaceModel.findOne({
    _id: workspaceId,
    ownerId,
  })
    .select("_id name slug ownerId createdAt updatedAt")
    .lean();

  if (!workspace) {
    return null;
  }

  return {
    id: workspace._id.toString(),
    name: workspace.name,
    slug: workspace.slug,
    ownerId: workspace.ownerId.toString(),
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}
export async function createWorkspace(
  input: CreateWorkspaceInput,
  ownerId: string
) {
  const baseSlug = input.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  const slug = `${baseSlug || "workspace"}-${crypto.randomUUID().slice(0, 8)}`;

  const workspace = await WorkspaceModel.create({
    name: input.name,
    slug,
    ownerId,
  });

  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    ownerId: workspace.ownerId.toString(),
    createdAt: workspace.createdAt,
  };
}
export async function getUserWorkspaces(ownerId: string) {
  const workspaces = await WorkspaceModel.find({ ownerId })
    .sort({ createdAt: -1 })
    .select("_id name slug ownerId createdAt updatedAt")
    .lean();

  return workspaces.map((workspace) => ({
    id: workspace._id.toString(),
    name: workspace.name,
    slug: workspace.slug,
    ownerId: workspace.ownerId.toString(),
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  }));
}