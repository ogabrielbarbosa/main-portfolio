import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// Share card for every page (see OG_IMAGE in content/seo.ts): the logo, the name and the domain.
export async function GET() {
  return new Response(await render(), { headers: { "Content-Type": "image/png" } });
}

// Cached so the card is drawn once at build time, not on every request.
async function render() {
  "use cache";
  const logo = await readFile(path.join(process.cwd(), "src/app/icon.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 56, padding: "0 96px", background: "#0a0a0a" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={240} height={240} alt="" style={{ imageRendering: "pixelated" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 76, fontWeight: 600, color: "#f2f2f2", letterSpacing: -2 }}>Gabriel Barbosa</div>
          <div style={{ fontSize: 38, color: "#a3a3a3" }}>AI Engineer & Product Builder</div>
          <div style={{ fontSize: 28, color: "#c6f432", marginTop: 22 }}>{"> ogabarbosa.com"}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  ).arrayBuffer();
}
