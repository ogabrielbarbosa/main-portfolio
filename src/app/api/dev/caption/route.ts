import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Dev only: the photo gallery (PhotoViewer) saves a caption straight into the page's MDX.
// In production this route does nothing.
const PAGE = /^\/(?:(en)\/)?experience\/([a-z0-9-]+)\/?$/;
const SRC = /^\/experience\/[a-z0-9-]+\/[a-z0-9._-]+$/i;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production")
    return new Response(null, { status: 404 });

  const { page, src, caption } = (await request.json()) as {
    page?: unknown;
    src?: unknown;
    caption?: unknown;
  };
  const match = typeof page === "string" ? PAGE.exec(page) : null;
  if (
    !match ||
    typeof src !== "string" ||
    !SRC.test(src) ||
    typeof caption !== "string"
  ) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const file = path.join(
    process.cwd(),
    "content/experience",
    match[2],
    `${match[1] ?? "pt"}.mdx`,
  );
  const source = await readFile(file, "utf8");
  // Plain text only: one line, no backslashes, straight quotes become curly so the MDX stays valid.
  const text = caption
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\\/g, "")
    .replace(/"/g, "”")
    .replace(/[{}<>]/g, "");
  const photo = new RegExp(
    `(\\{ src: "${escape(src)}", alt: "[^"]*")(?:, caption: "[^"]*")?( \\})`,
  );
  if (!photo.test(source))
    return Response.json({ error: "photo not found" }, { status: 404 });

  await writeFile(
    file,
    source.replace(photo, (_, head: string, tail: string) =>
      text ? `${head}, caption: "${text}"${tail}` : `${head}${tail}`,
    ),
  );
  return Response.json({ caption: text });
}
