import { ArrowUpRight, type LucideIcon, type LucideProps } from "lucide-react";

// Offsets are from the padding box, so -6px centers the 11px cross on the 1px
// line just outside it (a border or a gap-px divider).
const CROSSHAIR_POSITION = {
  tl: "-left-[6px] -top-[6px]",
  tr: "-right-[6px] -top-[6px]",
};

export function Crosshair({
  position = "tl",
  className = "",
}: {
  position?: keyof typeof CROSSHAIR_POSITION;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-10 size-[11px] ${CROSSHAIR_POSITION[position]} ${className}`}
    >
      <span className="absolute top-[5px] left-0 h-px w-[11px] bg-muted" />
      <span className="absolute top-0 left-[5px] h-[11px] w-px bg-muted" />
    </span>
  );
}

// Bordered block of the vertical "rail" with crosshairs on both top corners.
export function Frame({
  id,
  as: Tag = "section",
  className = "border-x border-b border-line bg-canvas",
  children,
}: {
  id?: string;
  as?: "section" | "header" | "footer" | "div";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag id={id} className={`relative scroll-mt-[72px] ${className}`}>
      <Crosshair position="tl" />
      <Crosshair position="tr" />
      {children}
    </Tag>
  );
}

export function Button({
  href,
  label,
  icon: Icon,
  variant = "outline",
  size = "md",
  iconClassName,
  className = "",
  download,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  variant?: "primary" | "outline";
  size?: "sm" | "md";
  iconClassName?: string;
  className?: string;
  download?: boolean;
}) {
  const variants = {
    primary: "bg-lime text-canvas font-bold hover:bg-fg",
    outline: "border border-edge bg-surface-2 text-fg font-medium hover:border-muted hover:bg-surface",
  };
  const iconColor = iconClassName ?? (variant === "primary" ? "text-canvas" : "text-muted");
  const padding = size === "sm" ? "px-4 py-[11px]" : "px-5 py-3.5";

  return (
    <a
      href={href}
      download={download || undefined}
      className={`inline-flex items-center gap-2.5 text-[13px] tracking-[0.5px] whitespace-nowrap transition-colors ${padding} ${variants[variant]} ${className}`}
    >
      {label}
      <Icon aria-hidden className={`size-4 shrink-0 ${iconColor}`} />
    </a>
  );
}

// Full-width bordered row: icon · label · value · trailing arrow. Used by the contact lists.
export function LinkRow({
  href,
  icon: Icon,
  label,
  value,
  action: Action = ArrowUpRight,
  download,
}: {
  href: string;
  icon: React.ComponentType<LucideProps>;
  label: string;
  value: string;
  action?: LucideIcon;
  download?: boolean;
}) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      download={download || undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 border-t border-line px-5 py-[18px] transition-colors hover:bg-surface sm:px-8"
    >
      <Icon aria-hidden className="size-[18px] shrink-0 text-muted" />
      <span className="hidden w-[110px] shrink-0 text-[11px] tracking-[1px] text-muted sm:block">{label}</span>
      <span className="min-w-0 flex-1 truncate text-sm">{value}</span>
      <Action aria-hidden className="size-4 shrink-0 text-muted transition-colors group-hover:text-lime" />
    </a>
  );
}

export function Tag({ label, highlight = false }: { label: string; highlight?: boolean }) {
  return (
    <span
      className={`border bg-surface px-[9px] py-[5px] text-[11px] font-medium tracking-[0.5px] ${
        highlight ? "border-lime text-lime" : "border-line text-muted"
      }`}
    >
      {label}
    </span>
  );
}

export function LiveDot() {
  return (
    <span aria-hidden className="relative inline-block size-4 shrink-0">
      <span className="absolute inset-0 animate-pulse-glow rounded-full bg-lime-dim" />
      <span className="absolute top-1 left-1 size-2 rounded-full bg-lime" />
    </span>
  );
}

export function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-lime font-pixel text-canvas ${
        size === "sm" ? "size-7 text-xs" : "size-9 text-[15px]"
      }`}
    >
      GB
    </span>
  );
}

export function Kicker({ index, path }: { index: string; path: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-pixel text-[13px] text-lime">[{index}]</span>
      <span aria-hidden className="h-px w-6 bg-muted" />
      <span className="text-xs text-muted">{path}</span>
    </div>
  );
}

export function SectionHeader({
  index,
  path,
  title,
  sub,
}: {
  index: string;
  path: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-6 border-b border-line px-5 pt-14 pb-10 sm:px-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3.5">
        <Kicker index={index} path={path} />
        <h2 className="text-[32px] font-extrabold tracking-[-1px] sm:text-[40px]">{title}</h2>
      </div>
      <p className="max-w-[480px] text-sm leading-[1.6] text-muted lg:text-right">{sub}</p>
    </div>
  );
}
