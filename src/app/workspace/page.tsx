import { buildRequest } from "@/lib/workbench/server";
import { modelChoices, projectListData } from "@/lib/workbench/contracts";
import { parseTokenUsage } from "@/lib/usage";
import type { Metadata } from "next";
import { WorkspaceHome } from "@/components/workspace-home";
import { authProvider, requireAccount } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Your workspace — LotusBuild" };
export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const { account, token } = await requireAccount();
  const [data, usageData, rawAccount] = await Promise.all([authProvider().projects(token), authProvider().usage(token), buildRequest("/me", token)]);
  const projects = projectListData(data);
  const tokenUsage = parseTokenUsage(usageData);
  return <WorkspaceHome models={modelChoices(rawAccount)} projects={projects} tokenUsage={tokenUsage} displayName={account.displayName} email={account.email} plan={account.plan.name} projectCount={account.projectCount} />;
}





