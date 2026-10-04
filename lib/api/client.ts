const REQUEST_TIMEOUT_MS = 15_000;
const MAX_GET_ATTEMPTS = 3;
const RETRY_BASE_MS = 300;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Firebase ID token. Sent as a bearer token, never as a cookie. */
  token?: string;
};

function baseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  return value.replace(/\/$/, "");
}

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// One request. Throws ApiError for an HTTP error response, and a TypeError for a
// network failure or a timeout.
async function send<T>(path: string, init: ApiRequestInit): Promise<T> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (init.body !== undefined) headers.set("Content-Type", "application/json");
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);

  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as {code?: string; message?: string};
    throw new ApiError(response.status, problem.code, problem.message ?? `Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

// Only reads are retried, and only on server errors or network failures. A write
// is never retried, since the server may already have applied it.
export async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const isRead = (init.method ?? "GET").toUpperCase() === "GET";
  const attempts = isRead ? MAX_GET_ATTEMPTS : 1;

  for (let attempt = 1; ; attempt++) {
    try {
      return await send<T>(path, init);
    } catch (error) {
      const retryable = error instanceof ApiError ? error.status >= 500 : true;
      if (!isRead || !retryable || attempt >= attempts) throw error;
      await wait(RETRY_BASE_MS * 2 ** (attempt - 1));
    }
  }
}
