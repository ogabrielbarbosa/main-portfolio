import { ArrowUpRight, BriefcaseBusiness, Globe, GraduationCap, type LucideProps } from "lucide-react";
import photo from "@/assets/gabriel.jpeg";
import photoMask from "@/assets/gabriel-mask.png";
import { LIDERHUB_JOBS } from "@/content/shared";
import type { ContactIcon, Dictionary } from "@/content/types";
import { CONTACT_ICONS } from "./BrandIcons";
import { DitherPhoto } from "./DitherPhoto";
import { Marquee } from "./sections/Footer";
import { Nav } from "./sections/Nav";
import { Frame, Tag } from "./ui";

// Right column on desktop; WhatsApp is the main call to action.
const SOCIALS: ContactIcon[] = ["instagram", "github", "whatsapp", "linkedin", "email"];

interface Item {
  key: string;
  label: string;
  // No href = not live yet: rendered as a disabled button with the "soon" tag.
  href?: string;
  icon: React.ComponentType<LucideProps>;
}

function LinkButton({ item, primary = false, soon }: { item: Item; primary?: boolean; soon: string }) {
  const { label, href, icon: Icon } = item;
  const base = "group flex items-center gap-3 px-5 py-3.5 text-[13px] tracking-[0.5px] whitespace-nowrap transition-colors";
  const content = (
    <>
      <Icon aria-hidden className={`size-4 shrink-0 ${primary ? "text-canvas" : "text-muted"}`} />
      <span className="flex-1">{label}</span>
    </>
  );

  if (!href) {
    return (
      <span aria-disabled className={`${base} cursor-default border border-line bg-surface font-medium text-muted`}>
        {content}
        <span className="-my-1.5">
          <Tag label={soon} />
        </span>
      </span>
    );
  }

  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${base} ${
        primary
          ? "bg-lime font-bold text-canvas hover:bg-fg"
          : "border border-edge bg-surface-2 font-medium text-fg hover:border-muted hover:bg-surface"
      }`}
    >
      {content}
      <ArrowUpRight
        aria-hidden
        className={`size-4 shrink-0 transition-colors ${primary ? "text-canvas" : "text-muted group-hover:text-lime"}`}
      />
    </a>
  );
}

export function LinksPage({ dict }: { dict: Dictionary }) {
  const { hero, contact, links } = dict;
  const home = dict.locale === "pt" ? "/" : "/en";

  const socials: Item[] = SOCIALS.map((icon) => {
    const { label, href } = contact.items.find((item) => item.icon === icon)!;
    return { key: icon, label, href, icon: CONTACT_ICONS[icon] };
  });
  const others: Item[] = [
    { key: "portfolio", label: links.portfolio, href: home, icon: Globe },
    { key: "work", label: links.work, href: LIDERHUB_JOBS, icon: BriefcaseBusiness },
    { key: "mentoring", label: links.mentoring, icon: GraduationCap },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-10">
      <Nav dict={dict} home={home} />
      <main>
        <Frame id="top" className="flex flex-col border-x border-b border-line bg-canvas lg:min-h-[640px]">
          <DitherPhoto src={photo} mask={photoMask} />
          <span role="img" aria-label={hero.photoAlt} />

          {/* Mobile: text → socials → links. Desktop: text and links on the left, socials bottom-right. */}
          <div className="relative flex flex-1 flex-col justify-center gap-9 px-5 pt-14 pb-12 sm:px-14 sm:pt-[72px] sm:pb-16 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:content-center lg:gap-x-10">
            <div className="flex flex-col gap-9 lg:col-start-1 lg:row-start-1">
              <p className="flex items-center gap-2.5 text-base sm:text-lg">
                <span className="font-bold text-lime">&gt;</span>
                {hero.greeting}
                <span aria-hidden className="h-5 w-2.5 animate-blink bg-lime" />
              </p>

              <h1 className="flex flex-col gap-1 text-[40px] leading-none font-extrabold tracking-[-0.036em] sm:text-[60px] xl:text-[84px]">
                <span className="flex items-center gap-[0.33em]">
                  {hero.titleLine1}
                  <span className="text-lime">&amp;</span>
                </span>
                <span>{hero.titleLine2}</span>
              </h1>

              <p className="text-lg leading-[1.4] sm:text-[22px]">{hero.value}</p>
            </div>

            <ul className="grid gap-2.5 sm:grid-cols-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-end">
              {socials.map((item) => (
                <li key={item.key} className={item.key === "email" ? "sm:col-span-2" : undefined}>
                  <LinkButton item={item} primary={item.key === "whatsapp"} soon={links.soon} />
                </li>
              ))}
            </ul>

            <ul className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap lg:col-start-1 lg:row-start-2">
              {others.map((item) => (
                <li key={item.key}>
                  <LinkButton item={item} soon={links.soon} />
                </li>
              ))}
            </ul>
          </div>
        </Frame>
      </main>
      <Marquee text={dict.marquee} />
    </div>
  );
}
