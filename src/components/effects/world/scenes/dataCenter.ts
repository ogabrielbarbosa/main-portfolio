import { Kit, mulberry, rect, shoot, type P3 } from "../kit";
import type { SceneBuilder } from "./types";

/**
 * A cold aisle in a data center: rows of racks on both sides running off to a far wall, servers
 * stacked in each with status LEDs flickering, ladder trays overhead carrying cables where pulses of
 * data run, a raised floor of perforated tiles. One-point perspective, so both sides of the text fill
 * up and the vanishing point hides behind it. Units are meters.
 */
export const dataCenter: SceneBuilder = (theme, flip) => {
  const k = new Kit(theme);
  const rand = mulberry(flip ? 7 : 3);
  const AISLE = 0.9; // half-width of the cold aisle
  const RACK_W = 0.6;
  const RACK_D = 1.1;
  const RACK_H = 2.2;
  const ROWS = 40; // racks per side
  const Z0 = 2;
  const Z_END = Z0 - ROWS * RACK_W - 1.2;
  const CEIL = 3.4;
  const U = RACK_H / 46;
  const leds: P3[] = [];
  const busy: boolean[] = [];

  for (const s of [-1, 1]) {
    const face = s * AISLE; // rack fronts
    const back = s * (AISLE + RACK_D);
    for (let r = 0; r < ROWS; r++) {
      const z1 = Z0 - r * RACK_W;
      const z0 = z1 - RACK_W;
      k.box(Math.min(face, back), Math.max(face, back), 0, RACK_H, z0, z1);
      const fx = face + s * -0.004;
      // Door frame and the mounting rails.
      rect(k, "x", fx, z0 + 0.03, z1 - 0.03, 0.06, RACK_H - 0.06);
      k.seg([fx, 0.1, z0 + 0.07], [fx, RACK_H - 0.1, z0 + 0.07]);
      k.seg([fx, 0.1, z1 - 0.07], [fx, RACK_H - 0.1, z1 - 0.07]);
      // Name plate on top.
      rect(k, "x", fx, z0 + 0.2, z1 - 0.2, RACK_H - 0.12, RACK_H - 0.07);
      // Servers of 1 to 4 U, with the odd blank panel.
      let u = 2;
      while (u < 44) {
        const h = [1, 1, 1, 2, 2, 4][Math.floor(rand() * 6)];
        if (u + h > 44) break;
        const y0 = u * U;
        const y1 = (u + h) * U;
        const blank = rand() < 0.1;
        k.seg([fx, y1, z0 + 0.07], [fx, y1, z1 - 0.07]);
        if (!blank) {
          // Drive bays on the bigger boxes, vents on the small ones.
          if (h >= 2) for (let b = 1; b < 6; b++) k.seg([fx, y0 + 0.01, z0 + 0.1 + b * 0.07], [fx, y1 - 0.01, z0 + 0.1 + b * 0.07]);
          else k.seg([fx, (y0 + y1) / 2, z0 + 0.12], [fx, (y0 + y1) / 2, z0 + 0.3]);
          const lz = s > 0 ? z1 - 0.1 : z0 + 0.1;
          const n = 1 + Math.floor(rand() * 3);
          for (let l = 0; l < n; l++) {
            leds.push([face - s * 0.01, (y0 + y1) / 2, lz - s * l * 0.025]);
            busy.push(rand() < 0.55);
          }
        }
        u += h;
      }
      // Cables dropping from the tray into the rack top.
      if (r % 3 === 1) k.seg([s * (AISLE + 0.5), RACK_H, (z0 + z1) / 2], [s * (AISLE + 0.5), CEIL - 0.55, (z0 + z1) / 2]);
    }
    // Ladder trays above each row, with cable bundles where the data runs.
    const tx = s * (AISLE + 0.5);
    for (const dx of [-0.22, 0.22]) k.seg([tx + dx, CEIL - 0.55, Z0 + 2], [tx + dx, CEIL - 0.55, Z_END]);
    for (let z = Z0 + 2; z > Z_END; z -= 0.3) k.seg([tx - 0.22, CEIL - 0.55, z], [tx + 0.22, CEIL - 0.55, z]);
    for (let z = Z0 + 1.5; z > Z_END; z -= 1.8) {
      k.seg([tx - 0.22, CEIL - 0.55, z], [tx - 0.22, CEIL, z]);
      k.seg([tx + 0.22, CEIL - 0.55, z], [tx + 0.22, CEIL, z]);
    }
    [-0.12, 0, 0.12].forEach((dx, i) =>
      k.current(
        [
          [tx + dx, CEIL - 0.5 + i * 0.02, Z0 - 4],
          [tx + dx, CEIL - 0.5 + i * 0.02, Z_END + 0.3],
        ],
        0.008,
        2 + i,
        0.18 + i * 0.07,
        (s + 1) * 0.3 + i * 0.2,
        0.45,
      ),
    );
  }
  k.lights(leds, 0.02, (i) => (busy[i] ? 11 + (i % 7) : 0.6 + (i % 5) * 0.3));

  // Raised floor: 60 cm tiles, perforated ones down the cold aisle.
  for (let x = -3.6; x <= 3.6 + 1e-6; x += 0.6) k.seg([x, 0, Z0 + 2], [x, 0, Z_END]);
  for (let z = Z0 + 2; z >= Z_END; z -= 0.6) k.seg([-3.6, 0, z], [3.6, 0, z]);
  for (let z = Z0 + 1.7; z > Z_END; z -= 1.2)
    for (const x of [-0.3, 0.3])
      for (let i = 1; i < 5; i++) k.seg([x - 0.25, 0.002, z - i * 0.12], [x + 0.25, 0.002, z - i * 0.12]);

  // Ceiling with light strips across the aisle.
  for (let z = Z0 + 1; z > Z_END; z -= 2.4) {
    k.edge([[-0.7, CEIL - 0.03, z], [0.7, CEIL - 0.03, z]]);
    k.seg([-0.7, CEIL - 0.03, z - 0.12], [0.7, CEIL - 0.03, z - 0.12]);
  }
  k.seg([-3.6, CEIL, Z0 + 2], [-3.6, CEIL, Z_END]);
  k.seg([3.6, CEIL, Z0 + 2], [3.6, CEIL, Z_END]);

  // Far wall: containment door with its window, and the exit sign glowing above.
  k.box(-3.6, 3.6, 0, CEIL, Z_END - 0.2, Z_END);
  rect(k, "z", Z_END + 0.01, -0.55, 0.55, 0, 2.15);
  rect(k, "z", Z_END + 0.01, -0.35, 0.35, 1.2, 1.9);
  k.box(-0.25, 0.25, 2.45, 2.65, Z_END, Z_END + 0.06);
  k.lights([[0, 2.55, Z_END + 0.08]], 0.18, () => 1.2);
  k.finish();

  const off = flip ? 0.12 : -0.12;
  return {
    kit: k,
    drift: 0.12,
    frame: (camera) =>
      shoot(camera, k.scene, {
        eye: [off, 1.55, Z0 - 1.2],
        target: [off * 0.3, 1.45, Z_END],
        fov: camera.aspect < 1 ? 70 : 58,
        fogNear: 4,
        fogFar: 26,
        orbit: 6,
      }),
  };
};
