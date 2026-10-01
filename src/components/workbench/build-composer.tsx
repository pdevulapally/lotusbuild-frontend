"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { workspaceRequest } from "@/lib/workbench/client";
import { projectData, sessionData } from "@/lib/workbench/contracts";
import { ModelPicker } from "./model-picker";
import { Composer } from "./composer";
export function BuildComposer({ models, projectId }: { models: string[]; projectId?: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(models.length === 1 ? models[0] : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function submit() {
    if (lock.current || !prompt.trim() || !model) return;
    lock.current = true; setBusy(true); setError("");
    let id = projectId;
    try {
      if (!id) id = projectData(await workspaceRequest("projects", "POST", { prompt })).id;
      const session = sessionData(await workspaceRequest(`projects/${id}/sessions`, "POST", { prompt, model }));
      router.push(`/workspace/${id}?session=${session.id}`);
    } catch (e) {
      if (id && !projectId) { router.push(`/workspace/${id}?start=failed`); return; }
      setError(e instanceof Error ? e.message : "Couldn’t start the build. Check your projects before trying again.");
      // Do not automatically retry a write with an uncertain outcome.
      setBusy(false); lock.current = false;
    }
  }
  return <>
    <Composer className={projectId ? "build-start-form workbench-first-composer" : "build-start-form"} value={prompt} onChange={setPrompt} onSubmit={() => void submit()}
      placeholder="What would you like to build?" ariaLabel="Describe your next project"
      disabled={busy} submitDisabled={busy || !prompt.trim() || !model} busy={busy} busyLabel="Starting build"
      footerLeft={<ModelPicker models={models} value={model} onChange={setModel} disabled={busy}/>}/>
    <div className="build-feedback" aria-live="polite">{busy && <p>Creating your workspace and starting the build…</p>}{error && <p role="alert">{error}</p>}</div>
  </>;
}
