import { permanentRedirect } from "next/navigation";

// llms.txt is English-only and lives at /llms.txt; keep old links working.
export const GET = () => permanentRedirect("/llms.txt");
