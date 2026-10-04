// Values safe to use on both server and client.

export const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a file from /public with the base path (needed on GitHub Pages). */
export function asset(path: string): string {
  return path.startsWith("/") ? `${basePath}${path}` : path;
}
