import { notFound } from "next/navigation";
import { authProvider, requireAccount } from "@/lib/auth/server";
import { AuthError, object } from "@/lib/auth/contracts";
import { buildRequest, snapshot } from "@/lib/workbench/server";
import { validId, projectData, projectListData, modelChoices, sessionData, type Session, type Message } from "@/lib/workbench/contracts";
import { parseTokenUsage } from "@/lib/usage";
import { ProjectWorkspace } from "@/components/workbench/project-workspace";
export const dynamic = "force-dynamic";
export const metadata = { title: "Project workspace — LotusBuild" };
async function loadProject({ params, searchParams }: { params: Promise<{ projectId: string }>; searchParams: Promise<{ session?: string; start?: string }> }) {
  const { projectId } = await params;
  try { validId(projectId); } catch { notFound(); }
  const { account, token } = await requireAccount();
  const query = await searchParams;
  try {
    const [rawProject, rawSessions, rawAccount, rawProjects, usageData] = await Promise.all([
      buildRequest(`/projects/${projectId}`, token),
      buildRequest(`/projects/${projectId}/sessions?limit=25`, token),
      buildRequest("/me", token),
      authProvider().projects(token),
      authProvider().usage(token),
    ]);
    const project = projectData(rawProject);
    if (!object(rawSessions) || !Array.isArray(rawSessions.sessions)) throw new Error("Invalid session list");
    const sessions = rawSessions.sessions.map(sessionData);
    let session: Session | null = sessions[0] ?? null;
    let messages: Message[] = [];
    if (query.session) { validId(query.session); session = sessionData(await buildRequest(`/sessions/${query.session}`, token)); }
    if (session) {
      if (session.projectId !== projectId) notFound();
      const current = await snapshot(session.id, token); session = current.session; messages = current.messages;
    }
    return {
      project, session, messages, models: modelChoices(rawAccount), startFailed: query.start === "failed",
      projects: projectListData(rawProjects), projectCount: account.projectCount, tokenUsage: parseTokenUsage(usageData),
      email: account.email, displayName: account.displayName, plan: account.plan.name,
    };
  } catch (e) { if (e instanceof AuthError && e.status === 404) notFound(); throw e; }
}
export default async function ProjectPage(props: { params: Promise<{ projectId: string }>; searchParams: Promise<{ session?: string; start?: string }> }) {
  const data = await loadProject(props);
  return <ProjectWorkspace key={data.session?.id ?? data.project.id} project={data.project} initialSession={data.session} initialMessages={data.messages} models={data.models} startFailed={data.startFailed}
    projects={data.projects} projectCount={data.projectCount} tokenUsage={data.tokenUsage} email={data.email} displayName={data.displayName} plan={data.plan}/>;
}
