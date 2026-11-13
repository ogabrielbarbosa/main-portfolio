import { watch } from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content");

// Bumped whenever anything under content/ changes, and passed into every "use cache" function that
// reads it so `next dev` picks up edited MDX without a restart (a new value is a new cache key).
// A file watcher keeps the count, so reading it does no I/O while rendering: with cacheComponents,
// uncached I/O during prerendering blocks the route. Kept on globalThis so a module reload doesn't
// reset it to a key that's already cached. Production pages are prerendered at build time, so there
// it is a constant.
const state = globalThis as { __contentVersion?: number };

if (process.env.NODE_ENV !== "production" && state.__contentVersion === undefined) {
  state.__contentVersion = 0;
  watch(CONTENT_DIR, { recursive: true }, () => {
    state.__contentVersion!++;
  }).unref();
}

export const contentVersion = () => state.__contentVersion ?? 0;
