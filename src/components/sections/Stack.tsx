import { BrainCircuit, Database, MonitorSmartphone, Workflow, type LucideIcon } from "lucide-react";
import type { Dictionary, StackGroupIcon } from "@/content/types";
import { Crosshair, Frame, SectionHeader } from "../ui";

const ICONS: Record<StackGroupIcon, LucideIcon> = {
  llm: BrainCircuit,
  front: MonitorSmartphone,
  back: Database,
  automation: Workflow,
};

export function Stack({ dict }: { dict: Dictionary }) {
  const { stack } = dict;

  return (
    <Frame>
      <SectionHeader index="05" path={stack.path} title={stack.title} sub={stack.sub} />

      <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {stack.groups.map((group, i) => {
          const Icon = ICONS[group.icon];
          return (
            <div key={group.icon} className="relative flex flex-col gap-6 bg-canvas px-5 pt-8 pb-9 sm:px-8">
              {i > 0 && <Crosshair className="hidden lg:block" />}
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2.5 font-pixel text-sm">
                  <Icon aria-hidden className="size-[18px] text-lime" />
                  {group.name}
                </h3>
                <span className="text-xs text-muted">{String(group.items.length).padStart(2, "0")}</span>
              </div>
              <ul>
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3 border-t border-line py-3 text-sm">
                    <span aria-hidden className="text-muted">
                      ›
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}
