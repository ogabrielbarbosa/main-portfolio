import { ArrowDown } from "lucide-react";
import photo from "@/assets/gabriel.jpeg";
import photoMask from "@/assets/gabriel-mask.png";
import { SECTION_IDS } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import { DitherPhoto } from "../DitherPhoto";
import { Button, Frame } from "../ui";

export function Hero({ dict }: { dict: Dictionary }) {
  const { hero } = dict;

  return (
    <Frame id="top" className="flex flex-col border-x border-b border-line bg-canvas lg:h-[640px]">
      <DitherPhoto src={photo} mask={photoMask} />
      <span role="img" aria-label={hero.photoAlt} />

      <div className="relative flex flex-1 flex-col justify-center gap-9 px-5 pt-14 pb-12 sm:px-14 sm:pt-[72px] sm:pb-16">
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

        <div className="flex flex-col gap-1.5 border-l-2 border-lime py-0.5 pl-5">
          <span className="text-xs text-muted">{hero.thesisComment}</span>
          <p className="text-base text-soft">{hero.thesis}</p>
        </div>

        <div>
          <Button href={`#${SECTION_IDS.projects}`} label={hero.cta} icon={ArrowDown} variant="primary" />
        </div>
      </div>
    </Frame>
  );
}
