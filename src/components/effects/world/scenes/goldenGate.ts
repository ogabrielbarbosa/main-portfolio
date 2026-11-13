import * as THREE from "three";
import { Kit, lerp, mulberry, rect, rod, sideX, type P3 } from "../kit";
import type { SceneBuilder } from "./types";

/**
 * The Golden Gate from the ocean side, up on the headland: the whole bridge across the screen with a
 * tower on each side of the text, the main cables sweeping between them, Fort Point under the south
 * arch, the Presidio and the Marin Headlands at either end, and out in the bay behind it Alcatraz with
 * its lighthouse and the San Francisco skyline. A ship slides under the span now and then.
 * Units are meters; x runs along the bridge (+x Marin), +z is the ocean.
 */

const DECK = 67;
const TOP = 227;
const CABLE_Z = 13.7;
const T = 640; // towers at ±T
const SIDE = 343; // side spans
const END = T + SIDE;

function tower(k: Kit, x: number) {
  const levels = [20, DECK, 113, 150, 186, 216, TOP];
  for (const zc of [-CABLE_Z, CABLE_Z]) {
    for (let i = 1; i < levels.length; i++) {
      const f = (i - 1) / (levels.length - 2);
      const hx = lerp(8.1, 5.2, f);
      const hz = lerp(5.0, 3.3, f);
      const [y0, y1] = [levels[i - 1], levels[i]];
      k.box(x - hx, x + hx, y0, y1, zc - hz, zc + hz);
      k.box(x - hx - 0.6, x + hx + 0.6, y1 - 1.4, y1, zc - hz - 0.6, zc + hz + 0.6);
      // The recessed vertical ribs that make the towers art deco.
      for (const u of [-0.55, 0, 0.55]) {
        k.seg([x + u * hx, y0 + 1.5, zc + hz + 0.05], [x + u * hx, y1 - 1.6, zc + hz + 0.05]);
        k.seg([x + u * hx, y0 + 1.5, zc - hz - 0.05], [x + u * hx, y1 - 1.6, zc - hz - 0.05]);
      }
    }
    k.box(x - 4.4, x + 4.4, TOP, TOP + 2.2, zc - 2.8, zc + 2.8);
    k.box(x - 3.2, x + 3.2, TOP + 2.2, TOP + 4.2, zc - 1.9, zc + 1.9);
  }
  // Pier and fender at the waterline.
  k.box(x - 28, x + 28, 0, 9, -CABLE_Z - 20, CABLE_Z + 20);
  k.box(x - 14, x + 14, 9, 20, -CABLE_Z - 9, CABLE_Z + 9);
  // Portal struts, each with a stepped face.
  for (const [y0, y1] of [
    [92, 104],
    [131, 141],
    [167, 177],
    [200, 209],
    [219, 226],
  ]) {
    const inner = CABLE_Z - 3.6;
    k.box(x - 4.2, x + 4.2, y0, y1, -inner, inner);
    for (let dz = -inner + 2.5; dz < inner - 2; dz += 2.6) k.seg([x, y0 + 1.2, dz], [x, y1 - 1.2, dz]);
  }
  // X-bracing under the deck.
  for (const [y0, y1] of [
    [20, 43],
    [43, 64],
  ]) {
    k.seg([x, y0, -CABLE_Z + 4], [x, y1, CABLE_Z - 4]);
    k.seg([x, y0, CABLE_Z - 4], [x, y1, -CABLE_Z + 4]);
    k.seg([x, y1, -CABLE_Z + 4], [x, y1, CABLE_Z - 4]);
  }
  // Aircraft beacons on the tops.
  k.lights(
    [
      [x, TOP + 4.6, -CABLE_Z],
      [x, TOP + 4.6, CABLE_Z],
    ],
    6,
    () => 2.2,
  );
}

const cable = (x: number) => {
  const ax = Math.abs(x);
  if (ax <= T) return 81 + 144 * (x / T) ** 2;
  const u = Math.min(1, (ax - T) / SIDE);
  return TOP - 2 + (DECK + 12 - TOP + 2) * u - 32 * Math.sin(Math.PI * u);
};

function bridge(k: Kit) {
  tower(k, -T);
  tower(k, T);
  const X0 = -END - 260;
  const X1 = END + 160;

  // Deck slab with sidewalks, the stiffening truss, rails and lamp posts.
  k.box(X0, X1, DECK - 1.2, DECK + 0.3, -16.8, 16.8);
  for (const s of [-1, 1]) {
    const z = s * 16.8;
    k.seg([X0, DECK - 7.6, z], [X1, DECK - 7.6, z]);
    for (let x = X0, i = 0; x < X1; x += 7.6, i++) {
      k.seg([x, DECK - 1.2, z], [x, DECK - 7.6, z]);
      k.seg([x, i % 2 ? DECK - 1.2 : DECK - 7.6, z], [x + 7.6, i % 2 ? DECK - 7.6 : DECK - 1.2, z]);
    }
    k.edge([
      [X0, DECK + 1.4, z],
      [X1, DECK + 1.4, z],
    ]);
    for (let x = X0 + 25; x < X1; x += 50) k.seg([x, DECK + 0.3, z], [x, DECK + 8, z]);
  }

  // South approach: the steel arch over Fort Point, then the viaduct on its piers.
  const archX = -END - 120;
  const arch: P3[] = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    arch.push([archX - 110 + 220 * u, 18 + 46 * Math.sin(Math.PI * u), 16.8]);
  }
  k.edge(arch);
  for (let i = 1; i < 24; i += 2) k.seg(arch[i], [arch[i][0], DECK - 1.2, 16.8]);
  for (let x = X0; x < archX - 110; x += 45) k.box(x - 3, x + 3, 0, DECK - 1.2, -12, 12);
  // Fort Point: the brick fort tucked under the arch, three tiers of casemates.
  k.box(archX - 45, archX + 45, 0, 26, -40, 40);
  for (const y of [7, 14, 21]) for (let x = archX - 40; x < archX + 40; x += 6) rect(k, "z", 40.05, x, x + 2.4, y - 3, y);
  k.box(archX - 46, archX + 46, 26, 28, -41, 41);

  // North abutment into the headland.
  k.box(END + 10, END + 60, 0, DECK + 4, -26, 26);
  for (let y = 10; y < DECK; y += 9) rect(k, "z", 26.05, END + 14, END + 56, y, y + 5);

  // Cables: glowing pulses running along both, suspenders hung every 15.2 m.
  [-CABLE_Z, CABLE_Z].forEach((z, i) => {
    const pts: P3[] = [];
    for (let x = -END; x <= END + 1e-6; x += 10) pts.push([x, cable(x), z]);
    k.current(pts, 1.1, 3, 0.25, i * 0.5, 0.85);
    for (let x = -END + 7.6; x < END - 4; x += 15.2) {
      if (Math.abs(Math.abs(x) - T) < 9) continue;
      k.seg([x, cable(x), z], [x, DECK + 0.3, z]);
    }
  });
}

function alcatraz(k: Kit, cx: number, cz: number) {
  // The rock: steep sides, flat top, longer than it is wide.
  k.terrain(
    cx - 420,
    cx + 420,
    cz - 200,
    cz + 200,
    (x, z) => {
      const u = (x - cx) / 300;
      const v = (z - cz) / 120;
      const r = Math.sqrt(u * u + v * v);
      return 40 * Math.min(1, Math.max(0, (1.15 - r) * 3)) + 4 * Math.sin(x * 0.05) * Math.cos(z * 0.07);
    },
    20,
    true,
    2,
  );
  // Cellhouse with rows of barred windows.
  k.box(cx - 90, cx + 50, 40, 64, cz - 30, cz + 20);
  for (const y of [46, 54]) for (let x = cx - 85; x < cx + 45; x += 7) rect(k, "z", cz + 20.05, x, x + 3, y, y + 5);
  // Lighthouse beside it, its lamp blinking.
  k.solid(rod([cx + 80, 40, cz], [cx + 80, 98, cz], 4, 3, 8));
  k.box(cx + 75, cx + 85, 98, 104, cz - 5, cz + 5);
  k.lights([[cx + 80, 106, cz]], 30, () => 1.6);
  // Water tower on its legs, and the dock building down by the water.
  for (const [dx, dz] of [
    [-6, -6],
    [6, -6],
    [6, 6],
    [-6, 6],
  ])
    k.seg([cx - 150 + dx, 40, cz - 60 + dz], [cx - 150 + dx * 0.6, 80, cz - 60 + dz * 0.6]);
  k.solid(new THREE.CylinderGeometry(9, 9, 14, 12).translate(cx - 150, 87, cz - 60));
  k.box(cx + 120, cx + 220, 0, 16, cz + 120, cz + 170);
}

function skyline(k: Kit, x0: number, x1: number, z: number, seed: number) {
  const rand = mulberry(seed);
  for (let x = x0; x < x1; ) {
    const w = 25 + rand() * 45;
    const core = Math.exp(-(((x - (x0 + x1) / 2) / ((x1 - x0) * 0.25)) ** 2));
    const h = 25 + rand() * 60 + core * rand() * 180;
    const zz = z - rand() * 500;
    k.box(x, x + w, 0, h, zz, zz + w);
    x += w + rand() * 25;
  }
  // Transamerica Pyramid and Salesforce Tower poke above the rest.
  const mid = (x0 + x1) / 2;
  k.solid(new THREE.ConeGeometry(28, 260, 4).rotateY(Math.PI / 4).translate(mid - 300, 130, z - 200));
  k.solid(new THREE.CylinderGeometry(22, 30, 326, 8).translate(mid + 150, 163, z - 260));
}

export const goldenGate: SceneBuilder = (theme, flip) => {
  const k = new Kit(theme);
  bridge(k);

  // Marin rising steep at the north end, the Presidio's lower hills at the south.
  k.terrain(
    END - 60,
    END + 3800,
    -3500,
    900,
    (x, z) => {
      const u = (x - END + 60) / 900;
      const ridge = 290 * Math.min(1, Math.max(0, u) ** 0.65) * (0.8 + 0.2 * Math.sin(z * 0.003 + 1.2));
      return ridge * (1 - Math.min(1, Math.max(0, (z - 300) / 600))) + 14 * Math.sin(x * 0.02) * Math.cos(z * 0.017);
    },
    70,
    true,
    2,
  );
  k.terrain(
    -END - 3800,
    -END - 180,
    -3500,
    700,
    (x, z) => {
      const u = Math.min(1, Math.max(0, (-END - 180 - x) / 600));
      const rolls = 1 + 0.35 * Math.sin(x * 0.004 + z * 0.006) + 0.25 * Math.sin(x * 0.011 - z * 0.003);
      const hill = 120 * u * u * (3 - 2 * u) * rolls;
      return hill * (1 - Math.min(1, Math.max(0, (z - 150) / 450)));
    },
    70,
    true,
    2,
  );
  // Presidio cypresses along the southern bluff.
  const rand = mulberry(9);
  for (let i = 0; i < 70; i++) {
    const x = -END - 300 - rand() * 1600;
    const z = -200 + rand() * 600;
    const h = 18 + rand() * 14;
    const base = 70 + rand() * 20;
    k.line([[x - h * 0.45, base, z], [x, base + h, z], [x + h * 0.45, base, z]]);
  }

  alcatraz(k, 900, -4900);
  skyline(k, -4800, -1600, -6200, 4);

  // Water: a faint grid and wave strokes.
  k.grid(14000, 280, 0, 0.035);
  for (let i = 0; i < 900; i++) {
    const x = -3500 + rand() * 7000;
    const z = -1500 + rand() * 4500;
    const len = 12 + rand() * 30;
    k.seg([x, 0.5, z], [x + len, 0.5, z + len * 0.05]);
  }

  // A container ship crossing under the span, out to sea, on a long loop.
  k.mover(
    (s) => {
      s.box(-14, 14, 0, 14, -120, 120);
      s.solid(new THREE.ConeGeometry(14, 36, 4).rotateY(Math.PI / 4).rotateX(-Math.PI / 2).scale(1, 0.5, 1).translate(0, 7, -138));
      for (let z = -100, i = 0; z < 70; z += 14, i++) s.box(-12, 12, 14, 22 + (i % 3) * 2.6, z, z + 12);
      s.box(-13, 13, 14, 42, 82, 108);
      s.box(-3, 3, 42, 54, 96, 102);
      s.lights([[0, 56, 99] as P3], 6, () => 1);
    },
    (obj, t) => {
      const u = ((t / 160) % 1) * 2 - 1;
      obj.position.set(-220, 0, -3200 * u);
    },
  );
  k.finish();

  const side = flip ? -1 : 1;
  return {
    kit: k,
    drift: 0.6,
    frame(camera, width) {
      camera.fov = camera.aspect < 1 ? 40 : 28;
      camera.far = 14000;
      camera.updateProjectionMatrix();
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const yaw = 0.32 * side;
      const elevation = 0.1;
      // The two towers just outside the text column (on phones the span overflows the edges).
      const sx = camera.aspect < 1 ? 1.25 : sideX(width) * 1.02;
      const distance = (T * Math.cos(yaw)) / (sx * t * camera.aspect);
      const look = new THREE.Vector3(0, 95, 0);
      const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(elevation), Math.sin(elevation), Math.cos(yaw) * Math.cos(elevation));
      camera.position.copy(look).addScaledVector(dir, distance);
      camera.up.set(0, 1, 0);
      camera.lookAt(look);
      const fog = k.scene.fog as THREE.Fog;
      fog.near = distance * 1.1;
      fog.far = distance * 7;
      return look;
    },
  };
};
