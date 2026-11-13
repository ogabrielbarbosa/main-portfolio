import * as THREE from "three";
import { Kit, palm, rod, shoot, sideX, type P3 } from "../kit";
import type { SceneBuilder } from "./types";

/**
 * Looking straight up a flagpole: the Brazilian flag waving high overhead, imperial palms leaning in
 * from the edge of the frame, and an airliner crossing the empty sky far above with its contrail.
 * Units are meters.
 */

// The flag is drawn on a 20 × 14 grid (the official proportions) and mapped onto moving cloth.
const FW = 20;
const FH = 14;
const GLOBE: [number, number, number] = [10, 7, 3.5];
// The white band: an arc rising from the left of the globe to the right, 0.5 wide.
const BAND_C: [number, number] = [12, -4.2];
const BAND_R = 11.85;

// Approximate sky over Rio on 15 Nov 1889: [x, y, size] in globe units (center 0,0, radius 3.5).
const STARS: [number, number, number][] = [
  [0.1, -1.9, 1], [0.35, -1.25, 0.8], [-0.35, -1.45, 0.8], [0.15, -2.55, 1], [-0.05, -1.55, 0.5], // Cruzeiro
  [1.7, -0.6, 0.8], [2.05, -1.05, 0.7], [2.35, -1.6, 0.8], [2.4, -2.15, 0.7], [2.0, -2.5, 0.6], [1.55, -2.65, 0.6], [1.2, -2.35, 0.9], [2.6, -0.25, 0.6], // Escorpião
  [-1.45, -0.5, 0.9], [-1.95, -0.95, 0.7], [-2.35, -0.35, 0.6], [-1.3, -1.4, 0.6], // Cão Maior
  [-2.6, 0.55, 1], [-2.95, -0.15, 0.6], // Canopus, Procyon
  [-0.9, -2.75, 0.6], [-1.35, -2.25, 0.5], [0.95, -3.05, 0.5], // Hidra, Oitante
  [0.6, -0.55, 0.6], [1.0, -1.0, 0.5], [-0.65, -0.75, 0.5], [-0.25, -0.25, 0.5], // Triângulo, Sigma
  [-1.0, 1.65, 0.9], // Spica, above the band
];
const MOTTO = "ORDEM E PROGRESSO";

function flagDrawing() {
  const bold: number[] = [];
  const fine: number[] = [];
  const seg = (to: number[], a: [number, number], b: [number, number]) => to.push(a[0] / FW, a[1] / FH, b[0] / FW, b[1] / FH);
  const poly = (to: number[], pts: [number, number][], closed = false) => {
    for (let i = 1; i < pts.length; i++) seg(to, pts[i - 1], pts[i]);
    if (closed) seg(to, pts[pts.length - 1], pts[0]);
  };
  const [gx, gy, gr] = GLOBE;
  const inGlobe = (x: number, y: number) => Math.hypot(x - gx, y - gy) <= gr + 1e-6;

  poly(bold, [[0, 0], [FW, 0], [FW, FH], [0, FH]], true);
  poly(bold, [[1.7, 7], [10, 12.3], [18.3, 7], [10, 1.7]], true);
  poly(bold, Array.from({ length: 72 }, (_, i) => [gx + gr * Math.cos((i / 72) * Math.PI * 2), gy + gr * Math.sin((i / 72) * Math.PI * 2)] as [number, number]), true);
  // Band edges, clipped to the globe.
  for (const r of [BAND_R - 0.25, BAND_R + 0.25]) {
    const pts: [number, number][] = [];
    for (let a = 1.2; a < 2.2; a += 0.004) {
      const p: [number, number] = [BAND_C[0] + r * Math.cos(a), BAND_C[1] + r * Math.sin(a)];
      if (inGlobe(...p)) pts.push(p);
      else if (pts.length) break;
    }
    poly(bold, pts.reverse());
  }
  // The motto: little strokes for letters along the middle of the band.
  const letters = [...MOTTO];
  const span = 0.42;
  const mid = Math.atan2(gy - BAND_C[1], gx - BAND_C[0]);
  letters.forEach((ch, i) => {
    if (ch === " ") return;
    const a = mid + span / 2 - (span * (i + 0.5)) / letters.length;
    const c: [number, number] = [BAND_C[0] + BAND_R * Math.cos(a), BAND_C[1] + BAND_R * Math.sin(a)];
    const n: [number, number] = [Math.cos(a) * 0.14, Math.sin(a) * 0.14];
    const t: [number, number] = [-Math.sin(a) * 0.07, Math.cos(a) * 0.07];
    poly(fine, [[c[0] - n[0] - t[0], c[1] - n[1] - t[1]], [c[0] + n[0] - t[0], c[1] + n[1] - t[1]], [c[0] + n[0] + t[0], c[1] + n[1] + t[1]], [c[0] - n[0] + t[0], c[1] - n[1] + t[1]]], ch === "O");
  });
  // Stars.
  for (const [sx, sy, size] of STARS) {
    const cx = gx + sx;
    const cy = gy + sy;
    const r = 0.13 * size + 0.05;
    const pts: [number, number][] = Array.from({ length: 10 }, (_, i) => {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.42 : r;
      return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
    });
    poly(fine, pts, true);
  }
  // Faint folds across the cloth so the waving reads in line art.
  for (let i = 1; i < 16; i++) seg(fine, [(i / 16) * FW, 0], [(i / 16) * FW, FH]);
  return { bold: new Float32Array(bold), fine: new Float32Array(fine) };
}

// How much each part of the cloth glows: field, rhombus, globe, band.
function region(u: number, v: number) {
  const x = u * FW;
  const y = v * FH;
  const [gx, gy, gr] = GLOBE;
  const d = Math.hypot(x - gx, y - gy);
  if (d <= gr) return Math.abs(Math.hypot(x - BAND_C[0], y - BAND_C[1]) - BAND_R) < 0.25 ? 3.6 : 1.8;
  return Math.abs(x - 10) / 8.3 + Math.abs(y - 7) / 5.3 <= 1 ? 2.7 : 1;
}

export const flag: SceneBuilder = (theme, flip) => {
  const k = new Kit(theme);
  const side = flip ? -1 : 1;
  const POLE = 17;
  const W = 6.4;
  const H = (W * FH) / FW;
  const TOP = POLE - 0.5;
  const HOIST = 0.14;

  // Pole, finial, the base it stands in.
  k.solid(rod([0, 0, 0], [0, POLE, 0], 0.12, 0.07, 10));
  k.solid(new THREE.SphereGeometry(0.16, 10, 8).translate(0, POLE + 0.12, 0));
  k.box(-0.08, 0.08, TOP - 0.06, TOP + 0.08, -0.05, 0.05);
  k.box(-0.6, 0.6, 0, 0.5, -0.6, 0.6);

  // The cloth: position of (u, v) at time t. u runs from the hoist to the fly, v from bottom to top.
  const cloth = (u: number, v: number, t: number, out: THREE.Vector3) => {
    const phase = Math.PI * 2 * (u * 1.25 - t * 0.5) + v * 0.9;
    const amp = 0.42 * Math.pow(u, 0.85);
    const z = amp * Math.sin(phase) + 0.07 * u * Math.sin(Math.PI * 2 * (u * 3.2 - t * 1.4) + v * 2.3);
    const x = HOIST + u * W * 0.97 - 0.05 * u * (1 - Math.cos(phase));
    const y = TOP - (1 - v) * H - 0.28 * u * u * (1.2 - v * 0.5);
    return out.set(x, y, z);
  };

  // Fill: a fine mesh shaded by region and by how the cloth faces the light.
  const NX = 110;
  const NY = 77;
  const fillGeo = new THREE.PlaneGeometry(1, 1, NX, NY);
  const fillPos = fillGeo.attributes.position as THREE.BufferAttribute;
  const uvs = fillGeo.attributes.uv as THREE.BufferAttribute;
  const colors = new Float32Array(fillPos.count * 3);
  fillGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  // Seen from behind (flip), the drawing is mirrored back so the flag still reads the right way.
  const mirror = (u: number) => (side > 0 ? u : 1 - u);
  const tone = Array.from({ length: fillPos.count }, (_, i) => region(mirror(uvs.getX(i)), uvs.getY(i)));
  const fillMat = k.fill(0.045, 0.92);
  fillMat.vertexColors = true;
  const fillMesh = new THREE.Mesh(fillGeo, fillMat);
  fillMesh.frustumCulled = false;
  fillMesh.renderOrder = 2;
  k.scene.add(fillMesh);

  // Lines: the drawing, re-projected onto the cloth every frame.
  const drawing = flagDrawing();
  if (side < 0) for (const set of [drawing.bold, drawing.fine]) for (let i = 0; i < set.length; i += 2) set[i] = 1 - set[i];
  const lineSet = (uv: Float32Array, opacity: number) => {
    const geo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array((uv.length / 2) * 3), 3));
    const obj = new THREE.LineSegments(geo, k.ink(opacity));
    obj.frustumCulled = false;
    k.scene.add(obj);
    return { uv, pos: geo.attributes.position as THREE.BufferAttribute };
  };
  const sets = [lineSet(drawing.bold, 0.85), lineSet(drawing.fine, 0.4)];

  const p = new THREE.Vector3();
  const q = new THREE.Vector3();
  k.every((t) => {
    for (let i = 0; i < fillPos.count; i++) {
      const u = uvs.getX(i);
      const v = uvs.getY(i);
      cloth(u, v, t, p);
      fillPos.setXYZ(i, p.x, p.y, p.z);
      // Slope of the cloth toward the viewer side: lit faces glow, faces turned away go dark.
      cloth(Math.min(1, u + 0.02), v, t, q);
      const lit = Math.max(0.25, 1 + ((q.z - p.z) / Math.max(1e-4, q.x - p.x)) * 1.6 * side);
      colors.fill(tone[i] * lit, i * 3, i * 3 + 3);
    }
    fillPos.needsUpdate = true;
    fillGeo.attributes.color.needsUpdate = true;
    for (const { uv, pos } of sets) {
      for (let i = 0; i < uv.length / 2; i++) {
        cloth(uv[i * 2], uv[i * 2 + 1], t, p);
        pos.setXYZ(i, p.x, p.y, p.z + 0.004 * side);
      }
      pos.needsUpdate = true;
    }
  });

  // Halyard lines down the pole, swaying a little.
  const halyard = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(2 * 9 * 3 * 2), 3));
  const halyardLine = new THREE.LineSegments(halyard, k.ink(0.35));
  halyardLine.frustumCulled = false;
  k.scene.add(halyardLine);
  k.every((t) => {
    const pos = halyard.attributes.position as THREE.BufferAttribute;
    let n = 0;
    for (const [dz, y0, y1] of [
      [0.1, TOP, 1.2],
      [-0.1, TOP - H, 1.2],
    ]) {
      for (let i = 0; i < 8; i++) {
        for (const j of [i, i + 1]) {
          const f = j / 8;
          const sway = 0.12 * Math.sin(Math.PI * f) * Math.sin(t * 1.3 + dz * 20);
          pos.setXYZ(n++, 0.1 + sway, y0 + (y1 - y0) * f, dz);
        }
      }
    }
    pos.needsUpdate = true;
  });

  // Imperial palms leaning in from the far edge of the frame.
  palm(k, [-26, 0, -22 * side], 24, 5, { imperial: true, lean: 0.04, reach: 5.5, fronds: 16 });
  palm(k, [-34, 0, -12 * side], 27, 9, { imperial: true, lean: 0.03, reach: 6, fronds: 16 });
  palm(k, [-40, 0, -30 * side], 23, 13, { imperial: true, lean: 0.05, reach: 5.2, fronds: 14 });

  // An airliner crossing the sky, with its contrail, on a long loop. Its path is laid out from the
  // camera in frame(), so it crosses the upper sky level on any screen.
  const PERIOD = 70;
  const lane = { center: new THREE.Vector3(0, 480, -560), dir: new THREE.Vector3(-1, 0, 0) };
  k.mover(
    (a) => {
      const L = 64;
      a.solid(new THREE.CylinderGeometry(3.1, 3.1, L * 0.78, 12, 1, true).rotateZ(Math.PI / 2));
      a.solid(new THREE.ConeGeometry(3.1, L * 0.12, 12).rotateZ(-Math.PI / 2).translate(L * 0.45, 0, 0)); // nose
      a.solid(new THREE.ConeGeometry(3.1, L * 0.16, 12).rotateZ(Math.PI / 2).translate(-L * 0.47, 0.8, 0)); // tail cone
      const wing = new THREE.Shape([new THREE.Vector2(6, 0), new THREE.Vector2(-8, 0), new THREE.Vector2(-22, 32), new THREE.Vector2(-16, 32)]);
      for (const s of [1, -1]) {
        a.solid(new THREE.ExtrudeGeometry(wing, { depth: 0.8, bevelEnabled: false }).rotateX((s * Math.PI) / 2).translate(0, -1, 0));
        const tail = new THREE.Shape([new THREE.Vector2(-23, 0), new THREE.Vector2(-30, 0), new THREE.Vector2(-35, 11), new THREE.Vector2(-31.5, 11)]);
        a.solid(new THREE.ExtrudeGeometry(tail, { depth: 0.5, bevelEnabled: false }).rotateX((s * Math.PI) / 2).translate(0, 1.5, 0));
        for (const d of [11, 21]) a.solid(new THREE.CylinderGeometry(1.4, 1.4, 6, 10, 1, true).rotateZ(Math.PI / 2).translate(-6 - d * 0.42, -2.6, s * d));
      }
      const fin = new THREE.Shape([new THREE.Vector2(-22, 0), new THREE.Vector2(-31, 0), new THREE.Vector2(-34, 13), new THREE.Vector2(-29, 13)]);
      a.solid(new THREE.ExtrudeGeometry(fin, { depth: 0.5, bevelEnabled: false }).translate(0, 2.5, -0.25));
      // Contrails from the four engines, thinning out behind.
      for (const z of [-21, -11, 11, 21]) for (let s = 0; s < 14; s++) a.seg([-12 - s * 40, -2.6, z * (1 + s * 0.08)], [-12 - (s + 0.8) * 40, -2.6, z * (1 + (s + 0.8) * 0.08)]);
      a.lights([[-8, -1, 32.5] as P3, [-8, -1, -32.5] as P3, [-34, 14, 0] as P3, [0, -3.2, 0] as P3], 5, (i) => (i < 2 ? 1.5 : 3));
    },
    (obj, t) => {
      const u = ((t / PERIOD) % 1) * 1.3 - 0.65;
      obj.position.copy(lane.center).addScaledVector(lane.dir, 2600 * u);
      obj.rotation.set(0, Math.atan2(-lane.dir.z, lane.dir.x), 0.02);
    },
  );
  k.finish();

  return {
    kit: k,
    drift: 0.25,
    frame: (camera, width) => {
      const look = shoot(camera, k.scene, {
        eye: [-2.5, 1.6, side * 13],
        target: [HOIST + W * 0.45, TOP - H * 0.55, 0],
        fov: camera.aspect < 1 ? 70 : 56,
        screenX: (camera.aspect < 1 ? 0.25 : sideX(width) * 0.9) * side,
        screenY: 0.18,
        fogNear: 40,
        fogFar: 2200,
        orbit: 12,
      });
      camera.updateMatrixWorld();
      const sky = new THREE.Vector3(0, 0.62, 0.5).unproject(camera).sub(camera.position).normalize();
      lane.center.copy(camera.position).addScaledVector(sky, 900);
      lane.dir.set(-sky.z, 0, sky.x).normalize().multiplyScalar(-side);
      return look;
    },
  };
};
