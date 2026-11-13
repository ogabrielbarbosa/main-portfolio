import * as THREE from "three";
import { Kit, mulberry, rect, rod, shoot, sideX, tree, type P3 } from "../kit";
import type { SceneBuilder } from "./types";

/**
 * 367 Addison Avenue, Palo Alto: standing in the driveway beside the house, looking back to the small
 * board-and-batten garage where Hewlett and Packard started in 1939. Clapboard house on one side, a
 * board fence and oaks on the other, utility lines over the street, the landmark plaque on its
 * boulder by the sidewalk. Units are meters.
 */

// Clapboard siding: horizontal lines across a wall, skipping openings.
function siding(k: Kit, axis: "x" | "z", at: number, a0: number, a1: number, y0: number, y1: number, holes: [number, number, number, number][], step = 0.22) {
  for (let y = y0 + step; y < y1; y += step) {
    const cuts = holes.filter(([, , h0, h1]) => y > h0 && y < h1).sort((a, b) => a[0] - b[0]);
    let from = a0;
    for (const [c0, c1] of cuts) {
      if (c0 > from) k.seg(axis === "x" ? [at, y, from] : [from, y, at], axis === "x" ? [at, y, c0] : [c0, y, at]);
      from = Math.max(from, c1);
    }
    if (from < a1) k.seg(axis === "x" ? [at, y, from] : [from, y, at], axis === "x" ? [at, y, a1] : [a1, y, at]);
  }
}

// A double-hung window with its trim and sash bars.
function window2(k: Kit, axis: "x" | "z", at: number, a: number, y: number, w: number, h: number, out: number) {
  const f = at + out * 0.03;
  rect(k, axis, f, a - w / 2 - 0.1, a + w / 2 + 0.1, y - 0.08, y + h + 0.12);
  rect(k, axis, f, a - w / 2, a + w / 2, y, y + h);
  const mid = y + h / 2;
  const p = (aa: number, yy: number): P3 => (axis === "x" ? [f, yy, aa] : [aa, yy, f]);
  k.seg(p(a - w / 2, mid), p(a + w / 2, mid));
  k.seg(p(a, mid), p(a, y + h));
  k.seg(p(a - w / 2, mid + h / 4), p(a + w / 2, mid + h / 4));
  // Sill.
  if (axis === "x") k.box(Math.min(at, f + out * 0.12), Math.max(at, f + out * 0.12), y - 0.14, y - 0.06, a - w / 2 - 0.15, a + w / 2 + 0.15);
  else k.box(a - w / 2 - 0.15, a + w / 2 + 0.15, y - 0.14, y - 0.06, Math.min(at, f + out * 0.12), Math.max(at, f + out * 0.12));
}

// Gable roof with its ridge along z, over x ∈ [x0, x1], z ∈ [z0, z1], with shingle courses.
function gableRoof(k: Kit, x0: number, x1: number, z0: number, z1: number, eave: number, ridge: number, over = 0.4) {
  const xm = (x0 + x1) / 2;
  const shape = new THREE.Shape([new THREE.Vector2(x0 - over, eave - over * 0.6), new THREE.Vector2(x1 + over, eave - over * 0.6), new THREE.Vector2(xm, ridge)]);
  k.solid(new THREE.ExtrudeGeometry(shape, { depth: z1 - z0 + over * 2, bevelEnabled: false }).translate(0, 0, z0 - over));
  const slope = (x: number) => eave - over * 0.6 + (ridge - eave + over * 0.6) * (1 - Math.abs(x - xm) / (xm - x0 + over));
  for (const s of [-1, 1]) {
    const run = xm - x0 + over;
    for (let d = 0.3; d < run; d += 0.3) {
      const x = xm + s * (run - d);
      k.seg([x, slope(x) + 0.02, z0 - over], [x, slope(x) + 0.02, z1 + over]);
    }
  }
  // Fascia trim on the gable ends.
  for (const z of [z0 - over - 0.02, z1 + over + 0.02])
    k.line([[x0 - over + 0.3, eave - over * 0.6 + 0.18, z], [xm, ridge - 0.3, z], [x1 + over - 0.3, eave - over * 0.6 + 0.18, z]]);
}

export const hpGarage: SceneBuilder = (theme, flip) => {
  const k = new Kit(theme);
  const side = flip ? -1 : 1;
  const rand = mulberry(367);

  /* The garage */
  const G = { x0: 1.2, x1: 4.6, z0: -19.5, z1: -14, eave: 2.55, ridge: 3.95 };
  k.box(G.x0, G.x1, 0, G.eave, G.z0, G.z1);
  gableRoof(k, G.x0, G.x1, G.z0, G.z1, G.eave, G.ridge, 0.3);
  const gm = (G.x0 + G.x1) / 2;
  const front = G.z1 + 0.02;
  // Gable infill above the doors, with a little vent.
  const tri = new THREE.Shape([new THREE.Vector2(G.x0, G.eave), new THREE.Vector2(G.x1, G.eave), new THREE.Vector2(gm, G.ridge - 0.1)]);
  k.solid(new THREE.ShapeGeometry(tri).translate(0, 0, G.z1));
  k.line([[gm - 0.25, G.eave + 0.35, front], [gm, G.eave + 0.7, front], [gm + 0.25, G.eave + 0.35, front]], true);
  // Board-and-batten: battens on every visible wall.
  for (let x = G.x0 + 0.15; x < G.x1; x += 0.3) k.seg([x, 0, front], [x, G.eave, front]);
  for (let x = G.x0 + 0.3; x < G.x1 - 0.2; x += 0.3) {
    const top = G.eave + (G.ridge - 0.1 - G.eave) * (1 - Math.abs(x - gm) / (gm - G.x0));
    k.seg([x, G.eave, front], [x, top, front]);
  }
  for (let z = G.z0 + 0.15; z < G.z1; z += 0.3) for (const x of [G.x0 - 0.02, G.x1 + 0.02]) k.seg([x, 0, z], [x, G.eave, z]);
  // The two swing doors with their Z-bracing, and a hasp.
  rect(k, "z", front + 0.02, G.x0 + 0.35, G.x1 - 0.35, 0, 2.15);
  k.edge([[gm, 0, front + 0.03], [gm, 2.15, front + 0.03]]);
  for (const [a, b] of [
    [G.x0 + 0.35, gm],
    [gm, G.x1 - 0.35],
  ]) {
    k.seg([a, 0.35, front + 0.03], [b, 0.35, front + 0.03]);
    k.seg([a, 1.8, front + 0.03], [b, 1.8, front + 0.03]);
    k.seg([a, 0.35, front + 0.03], [b, 1.8, front + 0.03]);
  }
  k.box(gm - 0.04, gm + 0.04, 1.0, 1.25, front, front + 0.06);
  // Side window, six panes.
  rect(k, "x", G.x1 + 0.03, -17.6, -16.4, 1.1, 1.9);
  k.seg([G.x1 + 0.03, 1.5, -17.6], [G.x1 + 0.03, 1.5, -16.4]);
  for (const z of [-17.2, -16.8]) k.seg([G.x1 + 0.03, 1.1, z], [G.x1 + 0.03, 1.9, z]);

  /* The house: two stories, clapboard, front-gabled, with a porch to the street */
  const H = { x0: -10.5, x1: 0, z0: -12, z1: 2.5, eave: 6.3, ridge: 10 };
  k.box(H.x0, H.x1, 0, H.eave, H.z0, H.z1);
  k.box(H.x0 - 0.15, H.x1 + 0.15, 0, 0.7, H.z0 - 0.15, H.z1 + 0.15); // foundation
  gableRoof(k, H.x0, H.x1, H.z0, H.z1, H.eave, H.ridge, 0.6);
  const hm = (H.x0 + H.x1) / 2;
  const hTri = new THREE.Shape([new THREE.Vector2(H.x0, H.eave), new THREE.Vector2(H.x1, H.eave), new THREE.Vector2(hm, H.ridge - 0.2)]);
  k.solid(new THREE.ShapeGeometry(hTri).translate(0, 0, H.z1));
  // Windows on the driveway side and the front.
  const sideWins: [number, number][] = [];
  for (const z of [-9.5, -5.5, -1.5]) for (const y of [1.6, 4.2]) sideWins.push([z, y]);
  for (const [z, y] of sideWins) window2(k, "x", H.x1, z, y, 0.9, 1.5, 1);
  siding(k, "x", H.x1 + 0.01, H.z0, H.z1, 0.7, H.eave, sideWins.map(([z, y]) => [z - 0.6, z + 0.6, y - 0.2, y + 1.7]));
  const frontWins: [number, number][] = [
    [-8, 4.2],
    [-2.5, 4.2],
    [-8, 1.6],
  ];
  for (const [x, y] of frontWins) window2(k, "z", H.z1, x, y, 1, 1.5, 1);
  window2(k, "z", H.z1, hm, 7.3, 0.7, 1.1, 1); // attic
  rect(k, "z", H.z1 + 0.03, -4.0, -3.0, 0.7, 2.9); // front door
  siding(k, "z", H.z1 + 0.01, H.x0, H.x1, 0.7, H.eave, [...frontWins.map(([x, y]) => [x - 0.65, x + 0.65, y - 0.2, y + 1.7] as [number, number, number, number]), [-4.1, -2.9, 0.6, 3]]);
  // Porch: deck, posts, roof, steps.
  k.box(-6.5, -0.5, 0.45, 0.7, H.z1, H.z1 + 2.6);
  for (const x of [-6.3, -3.5, -0.7]) k.solid(rod([x, 0.7, H.z1 + 2.4], [x, 3.2, H.z1 + 2.4], 0.11, 0.09, 8));
  k.box(-6.8, -0.2, 3.2, 3.4, H.z1, H.z1 + 2.9);
  for (let i = 0; i < 3; i++) k.box(-4.3, -2.7, 0, 0.15 * (3 - i), H.z1 + 2.6 + i * 0.3, H.z1 + 2.9 + i * 0.3);
  for (let x = -6.3; x < -4.4; x += 0.15) k.seg([x, 0.7, H.z1 + 2.45], [x, 1.5, H.z1 + 2.45]);
  k.seg([-6.3, 1.5, H.z1 + 2.45], [-4.4, 1.5, H.z1 + 2.45]);
  // Chimney on the far side.
  k.box(-11.1, -10.3, 0, 11, -6, -4.8);

  /* Driveway, yard, fences */
  for (const x of [1, 4.8]) k.seg([x, 0.01, -14], [x, 0.01, 9]);
  for (let z = -13; z < 9; z += 3) k.seg([1, 0.01, z], [4.8, 0.01, z]);
  // Tall board fence down the far side of the driveway.
  k.box(5.4, 5.5, 0, 1.8, -21, 6);
  for (let z = -21; z < 6; z += 0.16) k.seg([5.38, 0, z], [5.38, 1.8, z]);
  for (let z = -21; z <= 6; z += 2.4) k.box(5.32, 5.42, 0, 1.95, z - 0.05, z + 0.05);
  // Low picket fence along the front of the yard.
  for (const [x0, x1] of [
    [-14, -4.3],
    [-2.7, 0.6],
  ]) {
    for (const y of [0.35, 0.8]) k.seg([x0, y, 7.6], [x1, y, 7.6]);
    for (let x = x0; x <= x1; x += 0.14) k.line([[x - 0.03, 0, 7.62], [x - 0.03, 0.95, 7.62], [x, 1.05, 7.62], [x + 0.03, 0.95, 7.62], [x + 0.03, 0, 7.62]]);
  }
  // Walk from the gate to the porch steps.
  for (const x of [-4.2, -2.8]) k.seg([x, 0.01, 7.6], [x, 0.01, H.z1 + 3.5]);

  // The landmark plaque on its boulder by the sidewalk.
  const rock = new THREE.IcosahedronGeometry(0.62, 1);
  const rp = rock.attributes.position;
  for (let i = 0; i < rp.count; i++) {
    const n = 0.85 + rand() * 0.3;
    rp.setXYZ(i, rp.getX(i) * n * 1.25, Math.max(-0.1, rp.getY(i) * n * 0.8), rp.getZ(i) * n);
  }
  k.solid(rock.translate(7.2, 0.35, 7.9));
  k.box(6.85, 7.55, 0.45, 0.85, 8.42, 8.48);
  for (let i = 1; i < 4; i++) k.seg([6.92, 0.47 + i * 0.09, 8.49], [7.48, 0.47 + i * 0.09, 8.49]);

  // Mailbox on its post.
  k.box(0.75, 0.85, 0, 1.05, 8.6, 8.7);
  k.box(0.6, 1.0, 1.05, 1.3, 8.4, 8.95);

  /* Sidewalk, street, utility lines */
  for (const z of [8.2, 10]) k.edge([[-40, 0.02, z], [40, 0.02, z]]);
  for (let x = -40; x < 40; x += 1.5) k.seg([x, 0.02, 8.2], [x, 0.02, 10]);
  k.box(-40, 40, 0, 0.15, 10, 10.25); // curb
  for (let x = -40; x < 40; x += 6) k.seg([x, 0.01, 15.5], [x + 3, 0.01, 15.5]);
  const poles = [-26, 9, 44];
  for (const x of poles) {
    k.solid(rod([x, 0, 10.8], [x, 10.5, 10.8], 0.16, 0.12, 8));
    k.box(x - 1.3, x + 1.3, 9.6, 9.75, 10.7, 10.9);
    for (const dx of [-1.1, 0, 1.1]) k.box(x + dx - 0.05, x + dx + 0.05, 9.75, 9.95, 10.75, 10.85);
    k.solid(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 10).translate(x + 0.5, 8.6, 10.5)); // transformer
  }
  for (let i = 1; i < poles.length; i++)
    for (const dx of [-1.1, 0, 1.1]) {
      const pts: P3[] = [];
      for (let s = 0; s <= 16; s++) {
        const u = s / 16;
        pts.push([poles[i - 1] + dx + (poles[i] - poles[i - 1]) * u, 9.95 - 0.7 * Math.sin(Math.PI * u), 10.8]);
      }
      k.line(pts);
    }
  // Service drop to the house.
  k.line(Array.from({ length: 9 }, (_, s) => [lerp(9, -0.2, s / 8), 9.4 - 1.2 * Math.sin((Math.PI * s) / 8) - 2.5 * (s / 8), lerp(10.8, -1, s / 8)] as P3));

  /* Trees */
  tree(k, [-1, 0, -26], 13, 9, 11);
  tree(k, [9, 0, -10], 11, 7, 23);
  tree(k, [-15, 0, 8.8], 12, 7, 37);
  tree(k, [14, 0, 9], 10, 6, 41);
  k.grid(200, 50, 0, 0.04);
  k.finish();
  k.scene.scale.x = side;

  return {
    kit: k,
    drift: 0.3,
    frame: (camera, width) =>
      shoot(camera, k.scene, {
        eye: [side * 4.7, 1.6, 7.5],
        target: [side * gm, 1.9, G.z1],
        fov: camera.aspect < 1 ? 62 : 44,
        screenX: (camera.aspect < 1 ? 0.3 : sideX(width) * 0.82) * side,
        screenY: -0.05,
        fogNear: 14,
        fogFar: 70,
        orbit: 10,
      }),
  };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
