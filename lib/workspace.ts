// Turns a display name into a URL segment: "Preetham Devulapally" -> "preetham-devulapally".
// Returns an empty string when nothing usable is left; callers must not redirect in that case.
export function workspaceSlug(displayName: string): string {
  return displayName
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
