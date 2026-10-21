import type { Dictionary } from "@/content/types";
import { Crosshair, Frame, Kicker } from "../ui";

export function Principles({ dict }: { dict: Dictionary }) {
  const { principles } = dict;
  const total = String(principles.items.length).padStart(2, "0");

  return (
    <Frame className="flex flex-col border-x border-b border-line bg-canvas lg:flex-row">
      <div className="flex flex-col gap-5 border-b border-line px-5 py-14 sm:px-10 lg:w-[440px] lg:shrink-0 lg:border-r lg:border-b-0">
        <Kicker index="04" path={principles.path} />
        <h2 className="text-[32px] leading-[1.1] font-extrabold tracking-[-1px] whitespace-pre-line sm:text-[40px]">
          {principles.title}
        </h2>
        <p className="text-sm leading-[1.6] text-muted">{principles.sub}</p>
        <span aria-hidden className="font-pixel text-[64px] text-line">
          {total}/{total}
        </span>
      </div>

      <ol className="relative flex-1 divide-y divide-line">
        <Crosshair className="hidden lg:block" />
        {principles.items.map((principle, i) => (
          <li key={principle.title} className="flex gap-5 px-5 py-7 sm:gap-8 sm:px-10">
            <span className="pt-1.5 text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex flex-1 flex-col gap-2.5">
              <h3 className="flex items-center gap-3 text-lg font-bold sm:text-xl">
                <span aria-hidden className="font-normal text-lime">
                  ▸
                </span>
                {principle.title}
              </h3>
              <p className="text-sm leading-[1.6] whitespace-pre-line text-muted">{principle.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}
