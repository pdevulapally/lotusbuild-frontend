"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

import {AiInput} from "@/components/ai-input";
import {BuildStartError, startBuild} from "@/lib/api/build";
import Link from "next/link";
import {allowedModels} from "@/lib/api/me";
import {ApiError} from "@/lib/api/client";
import {useWorkspaceAccount} from "@/lib/workspace/use-account";
import {workspacePath} from "@/lib/workspace/slug";

// Landing-page composer: not signed in -> sign in first, signed in -> creates
// a real project and session from the prompt and opens its workspace.
export function HeroBuildInput() {
  const router = useRouter();
  const account = useWorkspaceAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  async function handleSubmit(prompt: string, model: string) {
    if (account.status !== "ready") {
      router.push("/sign-in");
      return false;
    }
    if (!account.me.emailVerified) {
      setError("Verify your email before starting a build.");
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    setCreatedProjectId(null);
    try {
      const token = await account.user.getIdToken();
      const projectId = await startBuild(token, prompt, model);
      router.push(workspacePath(account.username, projectId));
    } catch (failure) {
      if (failure instanceof BuildStartError) setCreatedProjectId(failure.projectId);
      setError(failure instanceof BuildStartError ? failure.message : failure instanceof ApiError ? failure.message : "Could not confirm the build. Check your projects before trying again.");
      setIsSubmitting(false);
      return false;
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <AiInput label="Describe a project to build" onSubmit={handleSubmit} isDisabled={isSubmitting}
        allowUnconfiguredSubmit={account.status === "signed-out"}
        models={account.status === "ready" ? allowedModels(account.me) : []} />
      {error && (
        <p className="text-center text-[13px] font-medium text-paper drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {error}
        </p>
      )}
      {createdProjectId && account.status === "ready" && <Link href={workspacePath(account.username, createdProjectId)} className="text-center text-[14px] underline">Open created project</Link>}
    </div>
  );
}
