import * as THREE from "three";
import { Kit, palm, ring, shoot, sideX, type P3 } from "../kit";
import type { SceneBuilder } from "./types";

/**
 * Stanford's Main Quad: standing in the courtyard, the sandstone arcade runs off beside you under its
 * red tile roof, and Memorial Church closes the far end with its arched porch and mosaic gable.
 * Palms in round planters dot the paving. Units are meters.
 */

const BAY = 4.6;
const ARCH_H = 6.2; // top of the arcade wall
const PIER = 0.45; // half the pier width
const SPRING = 3.2;
const DEPTH = 0.9; // arcade wall thickness
const WALK = 4.5; // arcade face to building wall
const EAVE = 13; // building wall height
const RIDGE = 16.5;

// Local → world for a wall: `a` runs along it, `d` goes away from the courtyard.
function wallFrame(axis: "x" | "z", at: number, out: 1 | -1) {
  const m = new THREE.Matrix4();
  if (axis === "z") m.makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(out, 0, 0)).setPosition(at, 0, 0);
  else m.makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, out)).setPosition(0, 0, at);
  const p = (a: number, y: number, d: number): P3 => {
    const v = new THREE.Vector3(a, y, d).applyMatrix4(m);
    return [v.x, v.y, v.z];
  };
  return { m, p };
}

function archShape(x0: number, x1: number, h: number, openings: [number, number, number][]) {
  const s = new THREE.Shape([new THREE.Vector2(x0, 0), new THREE.Vector2(x1, 0), new THREE.Vector2(x1, h), new THREE.Vector2(x0, h)]);
  for (const [l, r, spring] of openings) {
    const hole = new THREE.Path();
    const rad = (r - l) / 2;
    hole.moveTo(l, 0);
    hole.lineTo(l, spring);
    hole.absarc((l + r) / 2, spring, rad, Math.PI, 0, true);
    hole.lineTo(r, 0);
    hole.lineTo(l, 0);
    s.holes.push(hole);
  }
  return s;
}

const arc = (cx: number, cy: number, r: number, n = 16): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => [cx - r * Math.cos((Math.PI * i) / n), cy + r * Math.sin((Math.PI * i) / n)]);

// One run of arcade with the two-story building behind it and both tile roofs.
function arcade(k: Kit, axis: "x" | "z", at: number, out: 1 | -1, from: number, to: number) {
  const { m, p } = wallFrame(axis, at, out);
  const bays = Math.round((to - from) / BAY);
  for (let b = 0; b < bays; b++) {
    const a0 = from + b * BAY;
    const a1 = a0 + BAY;
    const geo = new THREE.ExtrudeGeometry(archShape(a0, a1, ARCH_H, [[a0 + PIER, a1 - PIER, SPRING]]), { depth: DEPTH, bevelEnabled: false, curveSegments: 10 });
    k.solid(geo.applyMatrix4(m));
    // Archivolt around the opening and the capitals the arch springs from.
    const rad = BAY / 2 - PIER;
    k.line(arc((a0 + a1) / 2, SPRING, rad + 0.35).map(([a, y]) => p(a, y, -0.02)));
    k.line([p(a0 + 0.1, SPRING - 0.25, -0.02), p(a0 + PIER + 0.25, SPRING - 0.25, -0.02)]);
    k.line([p(a1 - PIER - 0.25, SPRING - 0.25, -0.02), p(a1 - 0.1, SPRING - 0.25, -0.02)]);
    // Back wall: a door every other bay, arched windows upstairs.
    const mid = (a0 + a1) / 2;
    if (b % 2 === 0) k.line([p(mid - 0.8, 0, WALK - 0.01), p(mid - 0.8, 2.6, WALK - 0.01), p(mid + 0.8, 2.6, WALK - 0.01), p(mid + 0.8, 0, WALK - 0.01)]);
    else k.line([p(mid - 0.7, 1.0, WALK - 0.01), p(mid - 0.7, 3.4, WALK - 0.01), p(mid + 0.7, 3.4, WALK - 0.01), p(mid + 0.7, 1.0, WALK - 0.01)], true);
    const win = [...arc(mid, 10.6, 0.65, 8).map(([a, y]) => p(a, y, WALK - 0.01))];
    k.line([p(mid - 0.65, 8.9, WALK - 0.01), ...win, p(mid + 0.65, 8.9, WALK - 0.01)], true);
    k.seg(p(mid, 8.9, WALK - 0.01), p(mid, 11.25, WALK - 0.01));
  }
  const a1 = from + bays * BAY;
  // Walkway ceiling, building wall, cornice.
  k.solid(new THREE.BoxGeometry(a1 - from, 0.25, WALK - DEPTH).translate((from + a1) / 2, ARCH_H - 0.4, (DEPTH + WALK) / 2).applyMatrix4(m));
  k.solid(new THREE.BoxGeometry(a1 - from, EAVE, 2).translate((from + a1) / 2, EAVE / 2, WALK + 1).applyMatrix4(m));
  k.line([p(from, EAVE - 0.6, WALK - 0.02), p(a1, EAVE - 0.6, WALK - 0.02)]);
  // Lean-to tile roof over the arcade, and the main roof above the building.
  const lean = (d: number) => lerpY(d, -0.4, WALK, ARCH_H + 0.35, ARCH_H + 2.1);
  roof(k, p, from, a1, -0.4, WALK, lean, 0.32);
  const main = (d: number) => lerpY(d, WALK - 0.4, WALK + 7, EAVE + 0.2, RIDGE);
  roof(k, p, from, a1, WALK - 0.4, WALK + 7, main, 0.42);
}

const lerpY = (d: number, d0: number, d1: number, y0: number, y1: number) => y0 + ((d - d0) / (d1 - d0)) * (y1 - y0);

// A tile roof: a thin slab with the barrel tiles drawn as lines down the slope.
function roof(k: Kit, p: (a: number, y: number, d: number) => P3, a0: number, a1: number, d0: number, d1: number, y: (d: number) => number, step: number) {
  const corners = [p(a0, y(d0), d0), p(a1, y(d0), d0), p(a1, y(d1), d1), p(a0, y(d1), d1)];
  const geo = new THREE.BufferGeometry().setAttribute(
    "position",
    new THREE.Float32BufferAttribute([...corners[0], ...corners[1], ...corners[2], ...corners[0], ...corners[2], ...corners[3]], 3),
  );
  k.solid(geo);
  k.edge([p(a0, y(d0), d0), p(a1, y(d0), d0)]);
  for (let a = a0 + step / 2; a < a1; a += step) k.seg(p(a, y(d0) + 0.03, d0), p(a, y(d1) + 0.03, d1));
  for (let i = 1; i < 4; i++) {
    const d = d0 + ((d1 - d0) * i) / 4;
    k.seg(p(a0, y(d) + 0.03, d), p(a1, y(d) + 0.03, d));
  }
}

function church(k: Kit) {
  const FRONT = -62;
  const BACK = -78;
  const HALF = 15;
  // Nave block, gable on top.
  k.box(-HALF, HALF, 0, 19, BACK, FRONT);
  const gable = new THREE.Shape([new THREE.Vector2(-HALF - 0.5, 19), new THREE.Vector2(HALF + 0.5, 19), new THREE.Vector2(0, 27.5)]);
  k.solid(new THREE.ExtrudeGeometry(gable, { depth: FRONT - BACK, bevelEnabled: false }).translate(0, 0, BACK));
  // Gable trim with dentils, and the cross at the peak.
  const inset: [number, number][] = [
    [-HALF + 1.2, 19.6],
    [0, 26.6],
    [HALF - 1.2, 19.6],
  ];
  k.line(inset.map(([x, y]) => [x, y, FRONT + 0.03]));
  for (let i = 1; i < 30; i++) {
    const u = i / 30;
    const [x, y] = u < 0.5 ? [lerp(inset[0][0], 0, u * 2), lerp(inset[0][1], 26.6, u * 2)] : [lerp(0, inset[2][0], u * 2 - 1), lerp(26.6, inset[2][1], u * 2 - 1)];
    k.seg([x, y, FRONT + 0.03], [x, y - 0.35, FRONT + 0.03]);
  }
  k.box(-0.12, 0.12, 27.4, 29.4, FRONT - 0.6, FRONT - 0.3);
  k.box(-0.6, 0.6, 28.5, 28.75, FRONT - 0.6, FRONT - 0.3);

  // The mosaic: a framed panel with a row of standing figures and a central arch.
  const MZ = FRONT + 0.02;
  k.line([[-13, 11.6, MZ], [13, 11.6, MZ], [13, 18.6, MZ], [-13, 18.6, MZ]], true);
  k.line([[-12.6, 12, MZ], [12.6, 12, MZ], [12.6, 18.2, MZ], [-12.6, 18.2, MZ]], true);
  k.line([[-2.2, 12, MZ], ...arc(0, 15.8, 2.2, 16).map(([x, y]) => [x, y, MZ] as P3), [2.2, 12, MZ]]);
  k.line(ring(20, (a) => [Math.cos(a) * 0.5, 16.6 + Math.sin(a) * 0.5, MZ]), true);
  k.line([[-0.8, 12.2, MZ], [-0.6, 15.9, MZ], [0.6, 15.9, MZ], [0.8, 12.2, MZ]]);
  for (const s of [-1, 1])
    for (let i = 0; i < 6; i++) {
      const x = s * (3.4 + i * 1.5);
      k.line(ring(10, (a) => [x + Math.cos(a) * 0.28, 16.4 + Math.sin(a) * 0.28, MZ]), true);
      k.line([[x - 0.4, 12.3, MZ], [x - 0.35, 15.9, MZ], [x + 0.35, 15.9, MZ], [x + 0.4, 12.3, MZ]]);
    }
  // Tesserae: a faint grid across the gold background.
  for (let x = -12.6; x <= 12.6; x += 0.7) k.seg([x, 17.5, MZ], [x, 18.2, MZ]);

  // Porch with three arches.
  const porch = archShape(-HALF, HALF, 10, [
    [-3.2, 3.2, 5.2],
    [-10.6, -5.8, 4.6],
    [5.8, 10.6, 4.6],
  ]);
  k.solid(new THREE.ExtrudeGeometry(porch, { depth: 4, bevelEnabled: false, curveSegments: 14 }).translate(0, 0, FRONT));
  for (const [cx, r, spring] of [
    [0, 3.2, 5.2],
    [-8.2, 2.4, 4.6],
    [8.2, 2.4, 4.6],
  ]) {
    k.line(arc(cx, spring, r + 0.45, 18).map(([x, y]) => [x, y, FRONT + 4.02]));
    k.line(arc(cx, spring, r + 0.8, 18).map(([x, y]) => [x, y, FRONT + 4.02]));
    // Doors in the shadow of the porch.
    k.line([[cx - r * 0.6, 0, FRONT + 0.02], [cx - r * 0.6, spring + 0.6, FRONT + 0.02], [cx + r * 0.6, spring + 0.6, FRONT + 0.02], [cx + r * 0.6, 0, FRONT + 0.02]]);
  }
  roof(k, (a, y, d) => [a, y, FRONT + 4 - d], -HALF - 0.4, HALF + 0.4, -0.4, 4.2, (d) => lerpY(d, -0.4, 4.2, 10, 11.6), 0.32);

  // Side aisles and the crossing tower behind.
  for (const s of [-1, 1]) {
    k.box(Math.min(s * HALF, s * 23), Math.max(s * HALF, s * 23), 0, 11.5, BACK, FRONT - 0.5);
    for (let z = FRONT - 3; z > BACK; z -= 4) k.line(arc(z, 6, 0.9, 8).map(([zz, y]) => [s * 23.02, y, zz]));
  }
  k.solid(new THREE.CylinderGeometry(6.5, 6.5, 9, 8).rotateY(Math.PI / 8).translate(0, 23, -90));
  k.solid(new THREE.ConeGeometry(7.2, 4.5, 8).rotateY(Math.PI / 8).translate(0, 29.75, -90));
  k.solid(new THREE.CylinderGeometry(1.2, 1.2, 2.2, 8).translate(0, 33, -90));
  k.box(-HALF, HALF, 0, 22, -98, BACK);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const stanford: SceneBuilder = (theme, flip) => {
  const k = new Kit(theme);
  const side = flip ? -1 : 1;
  const W = 30;
  // Arcades down both long sides and across the ends beside the church.
  arcade(k, "z", -W, -1, -60 - 2 * BAY + 2, 50);
  arcade(k, "z", W, 1, -60 - 2 * BAY + 2, 50);
  arcade(k, "x", -60, -1, -W - WALK, -23);
  arcade(k, "x", -60, -1, 23, W + WALK);
  church(k);

  // Paving and the round planters with their palms.
  for (let x = -W; x <= W; x += 3) k.seg([x, 0, -58], [x, 0, 50]);
  for (let z = -58; z <= 50; z += 3) k.seg([-W, 0, z], [W, 0, z]);
  const planters: [number, number][] = [
    [-15, -36],
    [15, -36],
    [-15, -8],
    [15, -8],
    [-15, 20],
    [15, 20],
  ];
  planters.forEach(([x, z], i) => {
    for (const r of [5, 5.4]) k.line(ring(40, (a) => [x + Math.cos(a) * r, 0.35, z + Math.sin(a) * r]), true);
    k.solid(new THREE.CylinderGeometry(5.4, 5.4, 0.35, 40, 1, true).translate(x, 0.175, z));
    palm(k, [x, 0.35, z], 11 + (i % 3) * 1.5, 31 + i * 7, { fronds: 16, reach: 4.2 });
  });
  k.finish();

  return {
    kit: k,
    drift: 0.5,
    frame: (camera, width) =>
      shoot(camera, k.scene, {
        eye: [-side * 6, 1.7, 6],
        target: [0, 13, -62],
        fov: camera.aspect < 1 ? 64 : 50,
        screenX: (camera.aspect < 1 ? 0.3 : sideX(width) * 0.88) * side,
        screenY: 0.05,
        fogNear: 25,
        fogFar: 150,
        orbit: 14,
      }),
  };
};
