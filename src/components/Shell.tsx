import { HOME_PATH } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import { Logo } from "./Logos";

// The centered column every page lives in: header, page content, footer.
export function Shell({ dict, current, children }: { dict: Dictionary; current?: string; children: React.ReactNode }) {
  const { contacts } = dict;
  const email = contacts.find((c) => c.icon === "email")!;
  const socials = contacts.filter((c) => c.icon !== "email");

  return (
    <div className="wrap">
      <header className="site">
        <a className="home" href={HOME_PATH[dict.locale]}>
          gabriel barbosa
        </a>
        <nav>
          {dict.nav.map((link) => (
            <a key={link.href} href={link.href} aria-current={current === link.href ? "page" : undefined}>
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site">
        <span className="foot">
          <span className="socials">
            {socials.map((c) => (
              <a key={c.icon} href={c.href} rel="me" aria-label={c.label} title={c.label}>
                <Logo icon={c.icon} size={14} />
              </a>
            ))}
          </span>{" "}
          <a href={email.href}>{email.value}</a>
        </span>
        <a className="llms" href="/llms.txt">
          llms.txt
        </a>
      </footer>
    </div>
  );
}
