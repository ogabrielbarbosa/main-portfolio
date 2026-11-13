import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Country comes from the hosting edge (Vercel / Cloudflare). No header = local dev → no redirect.
function countryOf(request: NextRequest) {
  return request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
}

const isEnglish = (path: string) => path === "/en" || path.startsWith("/en/");

// Search engines, AI crawlers and link previews must see each language at its own URL (hreflang),
// and Googlebot crawls mostly from the US, so they are never redirected.
const BOTS =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|whatsapp|telegram|discord|slack|linkedin|pinterest|gpt|claude|anthropic|perplexity|lighthouse|headless/i;

// Language is picked automatically on every page: Brazil → PT (`/…`), anywhere else → EN (`/en/…`).
// Routes are the same in both languages, so `/experience/x` ↔ `/en/experience/x`.
export function proxy(request: NextRequest) {
  const country = countryOf(request);
  if (!country || BOTS.test(request.headers.get("user-agent") ?? "")) return NextResponse.next();

  const path = request.nextUrl.pathname;
  const wantsEnglish = country.toUpperCase() !== "BR";
  if (isEnglish(path) === wantsEnglish) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = wantsEnglish ? (path === "/" ? "/en" : `/en${path}`) : path.slice(3) || "/";
  return NextResponse.redirect(url);
}

export const config = {
  // Pages only: skip Next internals, API routes and anything with a file extension (images, llms.txt…).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
