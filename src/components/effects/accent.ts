// The accent slowly drifts through these colors: it holds each one for a while, then eases into the next.
const PALETTE = ["#5eead4", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6", "#f87171"];
const STEP_MS = 25_000;

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// Shared start time so the color keeps going across page loads instead of restarting.
function startedAt() {
  try {
    const saved = Number(sessionStorage.getItem("accent-start"));
    if (saved) return saved;
    const now = Date.now();
    sessionStorage.setItem("accent-start", String(now));
    return now;
  } catch {
    return Date.now();
  }
}

let start = 0;

export function accentAt(time = Date.now()): [number, number, number] {
  if (!start) start = startedAt();
  const pos = (time - start) / STEP_MS;
  const i = Math.floor(pos) % PALETTE.length;
  const frac = pos - Math.floor(pos);
  const mix = frac < 0.4 ? 0 : (1 - Math.cos(((frac - 0.4) / 0.6) * Math.PI)) / 2;
  const from = toRgb(PALETTE[i]);
  const to = toRgb(PALETTE[(i + 1) % PALETTE.length]);
  return [0, 1, 2].map((c) => Math.round(from[c] + (to[c] - from[c]) * mix)) as [number, number, number];
}

export function startAccent() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const style = document.documentElement.style;
  const paint = () => style.setProperty("--accent", `rgb(${accentAt().join(" ")})`);
  paint();
  const timer = setInterval(paint, 150);
  return () => clearInterval(timer);
}
