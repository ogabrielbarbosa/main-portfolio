import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Country comes from the hosting edge (Vercel / Cloudflare). No header = local dev → no redirect.
function countryOf(request: NextRequest) {
  return request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
}

// Language is picked automatically: Brazil → PT (`/`), anywhere else → EN (`/en`).
export function proxy(request: NextRequest) {
  const country = countryOf(request);
  if (!country) return NextResponse.next();

  const target = country === "BR" ? "/" : "/en";
  if (request.nextUrl.pathname === target) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/en"],
};
