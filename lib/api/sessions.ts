import {apiRequest} from "./client";

// Shapes from the backend's sessions/routes.ts (toResponse and toMessageResponse).
export type SessionStatus = "QUEUED" | "RUNNING" | "IDLE" | "FAILED";

export type Session = {
  id: string;
  projectId: string;
  status: SessionStatus;
  model: string;
  effort: string;
  sandboxId: string | null;
  error: string | null;
  messageCount: number;
  createdAt: string;
};

export type Message = {
  seq: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export async function listSessions(token: string, projectId: string): Promise<Session[]> {
  const {sessions} = await apiRequest<{sessions: Session[]}>(
    `/projects/${encodeURIComponent(projectId)}/sessions?limit=100`,
    {token},
  );
  return sessions;
}

export async function listMessages(token: string, sessionId: string): Promise<Message[]> {
  const {messages} = await apiRequest<{messages: Message[]}>(
    `/sessions/${encodeURIComponent(sessionId)}/messages?limit=100`,
    {token},
  );
  return messages;
}

// Whether a desktop is currently running for the session. Read-only; issues no viewer ticket.
export async function getDesktopStatus(token: string, sessionId: string): Promise<boolean> {
  const {available} = await apiRequest<{available: boolean}>(
    `/sessions/${encodeURIComponent(sessionId)}/desktop-status`,
    {token},
  );
  return available;
}

// Sends a follow-up prompt into an existing session.
export function sendFollowUp(token: string, sessionId: string, prompt: string) {
  return apiRequest(`/sessions/${encodeURIComponent(sessionId)}/messages`, {
    method: "POST",
    token,
    body: {prompt},
  });
}
