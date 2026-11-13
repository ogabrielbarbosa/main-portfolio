import photo from "@/assets/gabriel.jpeg";
import { absolute, SITE_URL } from "@/content/seo";
import { HOME_PATH, LINKS } from "@/content/shared";
import type { Dictionary } from "@/content/types";

// schema.org Person + ProfilePage, so search engines know who the site is about.
export function PersonJsonLd({ dict }: { dict: Dictionary }) {
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: dict.intro.name,
    jobTitle: dict.lede.strong.replace(/\.$/, ""),
    description: dict.meta.description,
    url: SITE_URL,
    image: absolute(photo.src),
    email: LINKS.email.value,
    address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" },
    sameAs: [LINKS.linkedin.href, LINKS.github.href, LINKS.instagram.href],
    knowsAbout: dict.about.stack.flatMap((g) => g.items),
    knowsLanguage: ["pt-BR", "en"],
  };
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absolute(HOME_PATH[dict.locale]),
    inLanguage: dict.locale === "pt" ? "pt-BR" : "en",
    mainEntity: person,
  };
  // `<` escaped so the JSON can't close the script tag.
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}
