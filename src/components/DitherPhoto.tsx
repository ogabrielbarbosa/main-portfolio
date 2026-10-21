"use client";

import type { StaticImageData } from "next/image";
import { useEffect, useRef } from "react";

// CSS px per dither cell — the canvas renders at this low resolution and is scaled up pixelated.
const CELL = 2;
// Radius of the scramble brush, in CSS px.
const BRUSH = 90;
// How long the scrambled area takes to settle back (ms, exponential decay constant).
const FADE_MS = 500;
// Max distance (in cells) a pixel is pulled from at the center of the brush.
const SCRAMBLE = 10;
// Horizontal point of the photo (0–1) kept in view: the face.
const FOCUS_X = 0.6;

// Lit cells are 1 bit (on/off) but carry a gray level: the person goes from mid gray to white
// with the photo's own brightness, the background (bridge) stays a dark gray.
const PERSON_GRAY = [96, 242];
const BG_GRAY = 52;
const OFF = 10; // --canvas
// How much of the background gets lit cells at most.
const BG_DENSITY = 0.55;

// 8x8 Bayer matrix, normalized to thresholds in (0, 1).
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54,
  22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29,
  53, 21,
].map((v) => (v + 0.5) / 64);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Where the photo sits inside a w×h box. Wide boxes (desktop hero) push the face to the right
// so the left side stays clear for the text; narrow ones crop around the face.
function placement(w: number, h: number, iw: number, ih: number) {
  const wide = w / h > 1.6;
  const scale = wide ? h / ih : Math.max(h / ih, w / iw);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = wide ? w * 0.78 - dw * FOCUS_X : Math.min(0, Math.max(w - dw, w / 2 - dw * FOCUS_X));
  return { dx, dy: (h - dh) * 0.4, dw, dh, wide };
}

// Value at the given percentile among the cells where `weight` is set (auto-levels).
function percentile(values: Float32Array, weight: Float32Array, p: number) {
  const picked: number[] = [];
  for (let i = 0; i < values.length; i++) if (weight[i] > 0.5) picked.push(values[i]);
  if (!picked.length) return p < 0.5 ? 0 : 1;
  picked.sort((a, b) => a - b);
  return picked[Math.floor((picked.length - 1) * p)];
}

export function DitherPhoto({
  src,
  mask: maskSrc,
  className = "",
}: {
  src: StaticImageData;
  mask: StaticImageData;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let base = new Uint8Array(0); // gray level per cell, the settled dither
    let scramble = new Float32Array(0); // 0 = settled, 1 = fully scrambled
    let frame: ImageData | null = null;
    let raf = 0;
    let last = 0;
    let prev: { x: number; y: number } | null = null;

    const load = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

    function build(img: HTMLImageElement, personMask: HTMLImageElement) {
      const rect = canvas!.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      w = Math.max(1, Math.round(rect.width / CELL));
      h = Math.max(1, Math.round(rect.height / CELL));
      canvas!.width = w;
      canvas!.height = h;
      const d = placement(w, h, img.naturalWidth, img.naturalHeight);

      ctx!.clearRect(0, 0, w, h);
      ctx!.drawImage(personMask, d.dx, d.dy, d.dw, d.dh);
      const m = ctx!.getImageData(0, 0, w, h).data;
      ctx!.clearRect(0, 0, w, h);
      ctx!.drawImage(img, d.dx, d.dy, d.dw, d.dh);
      const px = ctx!.getImageData(0, 0, w, h).data;

      const n = w * h;
      const lum = new Float32Array(n);
      const person = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
        person[i] = (m[i * 4] / 255) * (px[i * 4 + 3] / 255);
      }
      // Stretch the person's own range so the face isn't washed out by the bright evening light.
      const lo = percentile(lum, person, 0.03);
      const hi = percentile(lum, person, 0.985);

      base = new Uint8Array(n);
      scramble = new Float32Array(n);
      frame = new ImageData(w, h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const inPhoto = px[i * 4 + 3] / 255;
          // Dim what sits behind the text: the left column on desktop, everything on mobile.
          const text = d.wide ? 0.25 + 0.75 * smoothstep(0.4, 0.62, x / w) : 0.6;
          const t = BAYER[(y % 8) * 8 + (x % 8)];

          // Person: auto-leveled with a slight S-curve; the gray level follows the brightness.
          const fg = smoothstep(0, 1, clamp01((lum[i] - lo) / (hi - lo))) * text;
          // Background: inverted so the red bridge reads and the bright sky drops to black,
          // fading in from the photo's left edge.
          const edge = smoothstep(0, 0.35, (x - d.dx) / d.dw);
          const bg = clamp01(((1 - lum[i]) ** 1.3 - 0.25) / 0.75) * BG_DENSITY * edge * inPhoto * text;

          let gray = OFF;
          if (person[i] > 0.5) {
            if (fg > t) gray = PERSON_GRAY[0] + (PERSON_GRAY[1] - PERSON_GRAY[0]) * fg;
          } else if (bg > t) {
            gray = BG_GRAY;
          }
          base[i] = gray;
        }
      }
      render();
    }

    function render() {
      if (!frame) return;
      const out = frame.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          let gray = base[i];
          const s = scramble[i];
          if (s > 0.02) {
            // Pull this cell's value from a random nearby cell — a new one every frame.
            const r = s * SCRAMBLE;
            const sx = Math.min(w - 1, Math.max(0, Math.round(x + (Math.random() * 2 - 1) * r)));
            const sy = Math.min(h - 1, Math.max(0, Math.round(y + (Math.random() * 2 - 1) * r)));
            gray = base[sy * w + sx];
          }
          out[i * 4] = gray;
          out[i * 4 + 1] = gray;
          out[i * 4 + 2] = gray;
          out[i * 4 + 3] = 255;
        }
      }
      ctx!.putImageData(frame, 0, 0);
    }

    function tick(now: number) {
      const decay = Math.exp(-(now - last) / FADE_MS);
      last = now;
      let active = false;
      for (let i = 0; i < scramble.length; i++) {
        if (scramble[i] > 0.001) {
          scramble[i] *= decay;
          active = true;
        } else scramble[i] = 0;
      }
      render();
      raf = active ? requestAnimationFrame(tick) : 0;
    }

    function stamp(cx: number, cy: number) {
      const r = BRUSH / CELL;
      const x0 = Math.max(0, Math.floor(cx - r));
      const x1 = Math.min(w - 1, Math.ceil(cx + r));
      const y0 = Math.max(0, Math.floor(cy - r));
      const y1 = Math.min(h - 1, Math.ceil(cy + r));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const dist = Math.hypot(x - cx, y - cy) / r;
          if (dist >= 1) continue;
          const v = 1 - dist * dist;
          const i = y * w + x;
          if (v > scramble[i]) scramble[i] = v;
        }
      }
    }

    // Listens on window because the hero text sits above the canvas.
    function onMove(e: PointerEvent) {
      if (!frame) return;
      const rect = canvas!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / CELL;
      const y = (e.clientY - rect.top) / CELL;
      const r = BRUSH / CELL;
      if (x < -r || y < -r || x > w + r || y > h + r) {
        prev = null;
        return;
      }
      // Fill the gap between pointer events so fast moves leave a continuous trail.
      const from = prev ?? { x, y };
      const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / 4));
      for (let s = 1; s <= steps; s++) {
        stamp(from.x + ((x - from.x) * s) / steps, from.y + ((y - from.y) * s) / steps);
      }
      prev = { x, y };
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }

    let ro: ResizeObserver | null = null;
    let cancelled = false;
    Promise.all([load(src.src), load(maskSrc.src)]).then(([img, personMask]) => {
      if (cancelled) return;
      build(img, personMask);
      ro = new ResizeObserver(() => build(img, personMask));
      ro.observe(canvas);
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [src.src, maskSrc.src]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 size-full bg-canvas [image-rendering:pixelated] ${className}`}
    />
  );
}
