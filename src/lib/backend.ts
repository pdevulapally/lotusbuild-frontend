import "server-only";

export function backendUrl(path: string) {
  const configured = process.env.LOTUSBUILD_API_URL;
  if (!configured) throw new Error("LOTUSBUILD_API_URL is required");
  const url = new URL(configured);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      ))
  ) {
    throw new Error("Invalid LOTUSBUILD_API_URL");
  }
  url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
  return url;
}
