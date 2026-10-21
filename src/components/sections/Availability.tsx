"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/content/types";
import { Crosshair, Frame, LiveDot } from "../ui";

// Horário de Brasília, [início, fim) em horas.
const ONLINE_FROM = 7;
const ONLINE_UNTIL = 21;

function isOnlineNow() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", hour: "numeric", hourCycle: "h23" }).format(
      new Date(),
    ),
  );
  return hour >= ONLINE_FROM && hour < ONLINE_UNTIL;
}

export function Availability({ dict }: { dict: Dictionary }) {
  const { items, status } = dict.availability;
  // null até montar no cliente, pra não divergir do HTML do servidor.
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOnline(isOnlineNow());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Frame as="div" className="border-x border-b border-line bg-surface">
      <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
        {items.map((item, i) => (
          <div key={i} className="relative flex flex-col gap-2.5 bg-surface px-6 py-[22px]">
            {i > 0 && <Crosshair className="hidden lg:block" />}
            <dt className="text-[11px] tracking-[1px] text-muted">{item.label}</dt>
            <dd className="text-sm font-medium">{item.value}</dd>
          </div>
        ))}

        <div className="group relative flex flex-col gap-2.5 bg-surface px-6 py-[22px]" title={status.hours}>
          <Crosshair className="hidden lg:block" />
          <dt className="text-[11px] tracking-[1px] text-muted">{status.label}</dt>
          <dd className="flex items-center gap-3 text-sm font-medium">
            {online === null ? (
              <span className="text-muted">—</span>
            ) : online ? (
              <span className="flex items-center gap-2 text-lime">
                <LiveDot />
                {status.online}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-muted">
                <span aria-hidden className="size-2 rounded-full bg-muted" />
                {status.offline}
              </span>
            )}
            <span className="text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
              {status.hours}
            </span>
          </dd>
        </div>
      </dl>
    </Frame>
  );
}
