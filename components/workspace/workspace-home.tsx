"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

import {AiInput} from "@/components/ai-input";
import {BuildStartError, startBuild} from "@/lib/api/build";
import Link from "next/link";
import {allowedModels} from "@/lib/api/me";
import {ApiError} from "@/lib/api/client";
import {workspacePath} from "@/lib/workspace/slug";
import type {WorkspaceAccount} from "@/lib/workspace/use-account";

type ReadyAccount = Extract<WorkspaceAccount, {status: "ready"}>;

// The centered "describe what to build" screen shown when no project is open.
// WorkspaceShell renders the background photo behind this (and the sidebar);
// this just supplies the light-on-photo content.
export function WorkspaceHome({account}: {account: ReadyAccount}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  async function handleSubmit(prompt: string, model: string) {
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
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <h1 className="text-center font-sans text-2xl font-bold leading-[1.1] tracking-[-0.02em] text-paper drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] sm:text-4xl">
        Welcome back, {account.me.displayName ?? account.username}
      </h1>
      <div className="flex w-full max-w-2xl flex-col gap-3">
        <AiInput
          label="Describe what you want to build"
          onSubmit={handleSubmit}
          models={allowedModels(account.me)}
          isDisabled={isSubmitting}
          variant="glass"
        />
        {error && (
          <p className="text-center text-[13px] font-medium text-paper drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {error}
          </p>
        )}
        {createdProjectId && <Link href={workspacePath(account.username, createdProjectId)} className="text-center text-[14px] text-paper underline">Open created project</Link>}
      </div>
    </div>
  );
}
