"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { startAccent } from "./accent";
import { startKeyNav } from "./keynav";
import { startPageBits, type PageBits } from "./pagebits";

const LEAVE_MS = 400; // the old page dissolves for this long before the new one is swapped in

const isEnglish = (path: string) => path === "/en" || path.startsWith("/en/");

// Same gate as the reference: WebGL2 and a machine that won't choke on it.
function canRunWorld() {
  try {
    if (!document.createElement("canvas").getContext("webgl2")) return false;
  } catch {
    return false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.hardwareConcurrency ?? 8) >= 4 && (nav.deviceMemory ?? 8) >= 4;
}

// Everything that only runs in the browser: the drifting accent, keyboard navigation, the page
// transition and the 3D landmarks behind the page.
export function Effects() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const bits = useRef<PageBits | null>(null);
  const pending = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stops = [startAccent(), startKeyNav()];
    bits.current = startPageBits();
    const root = document.documentElement;

    // First load: the page assembles itself from bits once fonts and visible images are ready.
    if (root.classList.contains("entering")) {
      if (!bits.current) root.classList.remove("entering");
      else {
        const images = [...document.querySelectorAll<HTMLImageElement>("main img, footer.site img")]
          .filter((img) => img.getBoundingClientRect().top < innerHeight)
          .map((img) => img.decode().catch(() => {}));
        const ready = Promise.race([Promise.all(images), new Promise((r) => setTimeout(r, 800))]);
        Promise.all([document.fonts.ready, ready]).then(() => {
          if (!document.hidden && performance.now() < 2500) bits.current?.arrive();
          else root.classList.remove("entering");
        });
      }
    }

    // Same-site links: play the dissolve, then let the router swap the page in.
    const onClick = (e: MouseEvent) => {
      if (!bits.current || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest?.("a");
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      // /en and / have separate root layouts, so that switch is a full page load anyway.
      if (isEnglish(url.pathname) !== isEnglish(location.pathname)) return;
      e.preventDefault();
      const href = url.pathname + url.search + url.hash;
      router.prefetch(url.pathname + url.search);
      bits.current.leave(link);
      pending.current = true;
      setTimeout(() => router.push(href), LEAVE_MS);
      // If the new page never shows up, don't leave the screen blank.
      setTimeout(() => {
        if (pending.current) {
          pending.current = false;
          bits.current?.cancel();
        }
      }, 6000);
    };
    document.addEventListener("click", onClick, true);

    let stopWorld: (() => void) | undefined;
    let disposed = false;
    const begin = () => {
      if (!canvas.current || !canRunWorld()) return;
      import("./world").then(({ start }) => {
        if (!disposed && canvas.current) stopWorld = start(canvas.current);
      });
    };
    const idle =
      "requestIdleCallback" in window
        ? requestIdleCallback(begin, { timeout: 1500 })
        : (setTimeout(begin, 300) as unknown as number);

    return () => {
      disposed = true;
      if ("cancelIdleCallback" in window) cancelIdleCallback(idle);
      else clearTimeout(idle);
      document.removeEventListener("click", onClick, true);
      stops.forEach((stop) => stop());
      bits.current?.cancel();
      stopWorld?.();
    };
  }, [router]);

  // The router committed the new page: fly the bits into it.
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    requestAnimationFrame(() => requestAnimationFrame(() => bits.current?.arrive()));
  }, [pathname]);

  return <canvas ref={canvas} className="backdrop" aria-hidden="true" />;
}
