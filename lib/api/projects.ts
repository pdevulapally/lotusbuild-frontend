import {apiRequest} from "./client";

// One project as returned by GET /projects (toResponse in the backend's projects/routes.ts).
export type Project = {
  id: string;
  name: string;
  description?: string;
  platform: string;
  status: string;
  publicPreviewEnabled: boolean;
  createdAt: string;
};

// Lists the signed-in account's projects. The backend caps a page at 100.
export async function listProjects(token: string): Promise<Project[]> {
  const {projects} = await apiRequest<{projects: Project[]}>("/projects?limit=100", {token});
  return projects;
}
