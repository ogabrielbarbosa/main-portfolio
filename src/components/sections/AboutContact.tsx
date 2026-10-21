import { ArrowUpRight, Download, FileText, Mail, MessageCircle } from "lucide-react";
import { CV_EN, CV_PT, SECTION_IDS } from "@/content/shared";
import type { ContactIcon, Dictionary } from "@/content/types";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "../BrandIcons";
import { Crosshair, Frame, Kicker } from "../ui";

const ICONS: Record<ContactIcon, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  github: GithubIcon,
  whatsapp: MessageCircle,
  email: Mail,
};

export function AboutContact({ dict }: { dict: Dictionary }) {
  const { about, contact } = dict;

  return (
    <Frame id={SECTION_IDS.contact} className="flex flex-col border-x border-b border-line bg-canvas lg:flex-row">
      <div className="flex flex-1 flex-col gap-7 px-5 pt-14 pb-12 sm:px-10">
        <Kicker index="06" path={about.path} />
        <h2 className="text-[32px] font-extrabold tracking-[-1px] sm:text-[40px]">{about.title}</h2>
        <p className="text-base leading-[1.65] sm:text-[17px]">{about.paragraphs[0]}</p>
        <p className="text-[15px] leading-[1.65] text-muted">{about.paragraphs[1]}</p>
        <dl className="flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-6">
          {about.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1.5">
              <dt className="text-xs text-muted">{stat.label}</dt>
              <dd className="font-pixel text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative flex flex-col border-t border-line lg:w-[600px] lg:shrink-0 lg:border-t-0 lg:border-l">
        <Crosshair className="hidden lg:block" />
        <div className="flex flex-col gap-3.5 px-5 pt-14 pb-6 sm:px-8">
          <Kicker index="07" path={contact.path} />
          <h2 className="text-2xl font-extrabold">{contact.title}</h2>
        </div>

        <ul>
          {contact.items.map((item) => {
            const Icon = ICONS[item.icon];
            const external = item.href.startsWith("http");
            return (
              <li key={item.icon}>
                <a
                  href={item.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 border-t border-line px-5 py-[18px] transition-colors hover:bg-surface sm:px-8"
                >
                  <Icon aria-hidden className="size-[18px] shrink-0 text-muted" />
                  <span className="hidden w-[110px] shrink-0 text-[11px] tracking-[1px] text-muted sm:block">
                    {item.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{item.value}</span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 shrink-0 text-muted transition-colors group-hover:text-lime"
                  />
                </a>
              </li>
            );
          })}
          <li>
            <a
              href={dict.locale === "pt" ? CV_PT : CV_EN}
              download
              className="group flex items-center gap-4 border-t border-line px-5 py-[18px] transition-colors hover:bg-surface sm:px-8"
            >
              <FileText aria-hidden className="size-[18px] shrink-0 text-muted" />
              <span className="hidden w-[110px] shrink-0 text-[11px] tracking-[1px] text-muted sm:block">
                {contact.cvLabel}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{contact.cvUpdated}</span>
              <Download aria-hidden className="size-4 shrink-0 text-muted transition-colors group-hover:text-lime" />
            </a>
          </li>
        </ul>
      </div>
    </Frame>
  );
}
