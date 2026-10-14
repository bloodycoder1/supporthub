import { WorkspaceModel } from "./workspace.model";
import type { CreateWorkspaceInput } from "./workspace.validation";

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