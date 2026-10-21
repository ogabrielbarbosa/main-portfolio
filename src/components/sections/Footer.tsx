import { Frame } from "../ui";

export function Marquee({ text }: { text: string }) {
  const items = Array.from({ length: 4 });

  return (
    <Frame as="div" className="overflow-hidden border-y border-lime bg-canvas">
      <div className="flex h-[110px] items-center bg-lime-dim sm:h-[200px]">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex items-center">
              {items.map((_, i) => (
                <span key={i} className="flex items-center gap-6 pr-6 sm:gap-10 sm:pr-10">
                  <span className="font-pixel text-[64px] leading-none whitespace-nowrap text-lime sm:text-[132px]">
                    {text}
                  </span>
                  <span aria-hidden className="size-3 bg-lime sm:size-6" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}
