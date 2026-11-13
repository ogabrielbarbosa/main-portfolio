import Image from "next/image";
import photo from "@/assets/gabriel.jpeg";
import { ABOUT_PATH } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import { Shell } from "./Shell";

export function AboutPage({ dict }: { dict: Dictionary }) {
  const { about, intro, locale } = dict;

  return (
    <Shell dict={dict} current={ABOUT_PATH[locale]}>
      <div className="intro">
        <Image className="avatar" src={photo} alt={intro.photoAlt} width={72} height={72} priority />
        <h1>{about.title}</h1>
      </div>
      {about.paragraphs.map((text) => (
        <p key={text} className="lede">
          {text}
        </p>
      ))}

      <h2 id="principles">{about.principlesTitle}</h2>
      <ol className="log">
        {about.principles.map((item, i) => (
          <li key={item.title}>
            <span className="when">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 id="stack">{about.stackTitle}</h2>
      <dl className="kv" style={{ marginTop: 0 }}>
        {about.stack.map((group) => (
          <div key={group.name} style={{ display: "contents" }}>
            <dt>{group.name}</dt>
            <dd>{group.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </Shell>
  );
}
