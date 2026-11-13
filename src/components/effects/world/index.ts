import * as THREE from "three";
import { accentAt } from "../accent";
import type { Theme } from "./kit";
import { createPost } from "./post";
import { SCENES } from "./scenes";
import type { Landmark } from "./scenes/types";

const SCENE_MS = 45_000; // time on each landmark
const DISSOLVE_MS = 1600; // drawing breaks into digits…
const RESOLVE_MS = 1900; // …and the next one rains in
const GLITCH_MS = 520;
const SWEEP_MS = 5000;
const nextSweep = () => 8000 + Math.random() * 7000;
const nextGlitch = () => 12000 + Math.random() * 18000;
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * The 3D backdrop: one place at a time, framed beside the text column, slowly drifting.
 * Every 45 s it dissolves into 0s and 1s and the next landmark resolves. "," and "." step through.
 */
export function start(canvas: HTMLCanvasElement) {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const theme: Theme = { bg: new THREE.Color("#0a0a0a"), ink: new THREE.Color("#5eead4") };
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(theme.bg, 1);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 8000);
  const post = createPost(renderer);

  const names = Object.keys(SCENES) as (keyof typeof SCENES)[];
  const cache = new Map<string, Landmark>();
  const build = (i: number, flip: boolean) => {
    const key = `${i}:${flip}`;
    if (!cache.has(key)) cache.set(key, SCENES[names[i]](theme, flip));
    return cache.get(key)!;
  };

  // A shuffled order that survives page loads, so a refresh doesn't always start on the same place.
  const shuffled = () => {
    const order = names.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  };
  let saved: { order?: number[]; pos?: number } | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem("scenes") ?? "null");
  } catch {}
  const valid = Array.isArray(saved?.order) && saved.order.length === names.length && names.every((_, i) => saved!.order!.includes(i));
  const order = valid ? saved!.order! : shuffled();
  let pos = valid && Number.isInteger(saved?.pos) && saved!.pos! >= 0 && saved!.pos! < order.length ? saved!.pos! : 0;
  const query = new URLSearchParams(location.search);
  if (query.has("scene")) pos = Math.max(0, order.indexOf(Number(query.get("scene")) || 0));

  // Always the same side: a random mirror showed the flag (and the rest) back to front.
  const flip = query.get("flip") === "1";
  let current = build(order[pos], flip);
  const home = new THREE.Vector3();
  let look = new THREE.Vector3();

  function layout() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    look = current.frame(camera, innerWidth);
    home.copy(camera.position);
    try {
      sessionStorage.setItem("scenes", JSON.stringify({ order, pos }));
    } catch {}
    dispatchEvent(new CustomEvent("scenechange", { detail: { name: names[order[pos]], n: pos + 1, of: order.length } }));
  }
  layout();
  addEventListener("resize", layout);

  const go = (step: number) => {
    pos = (pos + step + order.length) % order.length;
    current = build(order[pos], flip);
    layout();
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  let change: { step: number; at: number; swapped: boolean } | null = null;
  let glitchAt = performance.now() + nextGlitch();
  let glitchPower = 0.65;
  let sweepAt = performance.now() + nextSweep();
  let sweepDown = Math.random() < 0.5;

  const schedule = () => {
    if (!still) timer = setTimeout(() => step(1), SCENE_MS);
  };
  function step(n: number) {
    if (change) return;
    clearTimeout(timer);
    if (still) {
      go(n);
      renderer.render(current.kit.scene, camera);
      return;
    }
    post.reseed();
    change = { step: n, at: performance.now(), swapped: false };
    glitchAt = change.at;
    glitchPower = 1;
  }
  schedule();

  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
    if (e.key === "," || e.key === ".") {
      e.preventDefault();
      step(e.key === "." ? 1 : -1);
    }
  };
  const onStep = () => step(1);
  // A page change makes the backdrop hiccup too.
  const onPageShift = () => {
    if (change) return;
    glitchAt = performance.now();
    glitchPower = 0.5;
  };
  addEventListener("keydown", onKey);
  addEventListener("scenestep", onStep);
  addEventListener("pageshift", onPageShift);

  const offset = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);
  let last = -Infinity;
  let frame = 0;

  function loop(now: number) {
    frame = requestAnimationFrame(loop);
    if (document.hidden || now - last < 1000 / 30 - 2) return;
    last = now;
    theme.ink.setRGB(...(accentAt().map((c) => c / 255) as [number, number, number]), THREE.SRGBColorSpace);
    current.kit.tick(now / 1000);

    // Slow drift: a little yaw, a little pitch, a little dolly.
    const drift = current.drift ?? 1;
    const yaw = drift * 0.044 * Math.sin((now / 40_000) * Math.PI * 2);
    const pitch = drift * (0.5 - 0.5 * Math.cos((now / 70_000) * Math.PI * 2)) * 0.085;
    const dolly = 1 - drift * 0.035 * Math.sin((now / 90_000) * Math.PI * 2);
    offset.copy(home).sub(look).applyAxisAngle(UP, yaw);
    axis.crossVectors(UP, offset).normalize();
    offset.applyAxisAngle(axis, -pitch).multiplyScalar(dolly);
    camera.position.copy(look).add(offset);
    camera.lookAt(look);

    let progress = 0;
    let dir = 1;
    if (change) {
      const out = (now - change.at) / DISSOLVE_MS;
      if (out < 1) progress = smooth(out);
      else {
        if (!change.swapped) {
          go(change.step);
          post.reseed();
          change.swapped = true;
        }
        const back = (now - change.at - DISSOLVE_MS) / RESOLVE_MS;
        if (back < 1) {
          progress = 1 - smooth(back);
          dir = -1;
        } else {
          change = null;
          schedule();
        }
      }
    }

    let glitch = 0;
    const g = (now - glitchAt) / GLITCH_MS;
    if (g >= 0 && g < 1) glitch = glitchPower * Math.sin(Math.PI * g) * (0.45 + 0.55 * Math.abs(Math.sin(g * 17)));
    else if (g >= 1) {
      glitchAt = now + nextGlitch();
      glitchPower = 0.45 + Math.random() * 0.4;
    }

    let sweep = 0;
    let sweepY = 0;
    const s = (now - sweepAt) / SWEEP_MS;
    if (s >= 0 && s < 1) {
      sweep = 1;
      sweepY = -0.15 + 1.3 * (sweepDown ? s : 1 - s);
    } else if (s >= 1) {
      sweepAt = now + nextSweep();
      sweepDown = !sweepDown;
    }

    post.render(current.kit.scene, camera, { time: now / 1000, glitch, progress, dir, sweep, sweepY, bg: theme.bg, ink: theme.ink });
  }

  if (still) {
    current.kit.tick(0);
    renderer.render(current.kit.scene, camera);
  } else frame = requestAnimationFrame(loop);
  canvas.classList.add("on");

  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    removeEventListener("resize", layout);
    removeEventListener("keydown", onKey);
    removeEventListener("scenestep", onStep);
    removeEventListener("pageshift", onPageShift);
    renderer.dispose();
  };
}
