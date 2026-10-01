export async function workspaceRequest(path: string, method: "GET" | "POST" | "DELETE", body?: unknown) {
  const response = await fetch(`/api/build/${path}`, { method, headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  const data = await response.json();
  if (!response.ok) {
    // /api/build always responds { error: string } on failure (see its catch block). A non-string
    // here means that contract broke, not that the server had nothing to say - surface it as a bug.
    if (typeof data.error !== "string") throw new Error(`Workspace request failed unexpectedly (${response.status}).`);
    throw new Error(data.error);
  }
  return data;
}
