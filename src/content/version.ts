import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content");

// Newest change under content/, passed into every "use cache" function that reads it so
// `next dev` picks up edited MDX without a restart (a new value is a new cache key).
// Production pages are prerendered at build time, so there it is a constant.
export async function contentVersion() {
  if (process.env.NODE_ENV === "production") return 0;
  const entries = await readdir(CONTENT_DIR, { recursive: true });
  const times = await Promise.all(
    ["", ...entries].map((entry) => stat(path.join(CONTENT_DIR, entry)).then((s) => s.mtimeMs)),
  );
  return Math.max(...times);
}
