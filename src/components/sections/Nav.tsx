import type { Dictionary } from "@/content/types";
import { Frame, LogoMark } from "../ui";

// `home` prefixes the section anchors when the nav is rendered outside the home page.
export function Nav({ dict, home = "" }: { dict: Dictionary; home?: string }) {
  return (
    <Frame
      as="header"
      className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-x border-b border-line bg-canvas px-4 sm:px-7"
    >
      <a href={`${home}#top`} className="flex items-center gap-3.5">
        <LogoMark />
        <span className="hidden text-sm font-bold tracking-[1px] sm:inline">GABRIEL BARBOSA</span>
      </a>

      <nav className="hidden items-center gap-10 md:flex">
        {dict.nav.links.map((link, i) => (
          <a key={link.href} href={`${home}${link.href}`} className="group flex items-center gap-2">
            <span className="text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[13px] font-medium tracking-[0.5px] transition-colors group-hover:text-lime">
              {link.label}
            </span>
          </a>
        ))}
      </nav>
    </Frame>
  );
}
