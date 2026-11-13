import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type P3 = [number, number, number];

export interface Theme {
  bg: THREE.Color;
  ink: THREE.Color;
}

// Fog for hand-written shaders: three fills fogNear/fogFar and defines USE_FOG when the scene has fog.
const FOG_VERT_HEAD = "#include <fog_pars_vertex>\n";
const FOG_FRAG_HEAD = `#include <fog_pars_fragment>
  float fogAmount(){
    #ifdef USE_FOG
      return smoothstep(fogNear, fogFar, vFogDepth);
    #else
      return 0.0;
    #endif
  }`;

// Shared pieces of the "current" shader: a bright band that travels along a tube.
const CURRENT_VERT = `${FOG_VERT_HEAD} varying vec2 vUv;
  void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
  }`;
const CURRENT_HEAD = `${FOG_FRAG_HEAD} uniform float uTime, uOffset, uRepeat, uSpeed, uBase; uniform vec3 uColor, uBg; varying vec2 vUv;
  float band(float x){ float p = fract(x * uRepeat - uTime * uSpeed + uOffset); return exp(-pow((p - 0.5) * 9.0, 2.0)); }`;

// Little lights (server LEDs, beacons): points that blink, each on its own phase and rate.
const BLINK_VERT = `${FOG_VERT_HEAD} attribute float aPhase; attribute float aRate; uniform float uTime, uSize; varying float vOn;
  void main(){
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float s = sin(uTime * aRate + aPhase * 6.2831);
    vOn = aRate > 9.0 ? step(0.0, sin(uTime * aRate * 1.7 + aPhase * 40.0) * s) : 0.35 + 0.65 * smoothstep(-0.2, 0.6, s);
    gl_PointSize = clamp(uSize * 300.0 / -mvPosition.z, 2.2, 9.0);
    #include <fog_vertex>
  }`;
const BLINK_FRAG = `${FOG_FRAG_HEAD} uniform vec3 uColor; varying float vOn;
  void main(){
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = (smoothstep(1.0, 0.0, d) * 0.6 + smoothstep(0.45, 0.2, d)) * vOn * (1.0 - fogAmount());
    gl_FragColor = vec4(mix(uColor, vec3(1.0), smoothstep(0.4, 0.0, d) * 0.6), a);
  }`;

interface Layer {
  solids: THREE.BufferGeometry[];
  masses: THREE.BufferGeometry[];
  fine: number[];
  bold: number[];
}

/**
 * Builds a place as a technical drawing: translucent solids with crisp outlines, thin detail lines,
 * glowing "currents" running along curves, blinking lights, and fog that eats the distance.
 * Everything is tinted with the site's accent, which keeps drifting, so colors are updated every tick.
 */
export class Kit {
  scene = new THREE.Scene();
  currentMats: THREE.ShaderMaterial[] = [];
  private layer: Layer = { solids: [], masses: [], fine: [], bold: [] };
  private fills: { mat: THREE.MeshBasicMaterial; mix: number }[] = [];
  private inks: THREE.LineBasicMaterial[] = [];
  private grids: THREE.LineBasicMaterial[] = [];
  private movers: { fn: (t: number) => void }[] = [];

  constructor(private theme: Theme) {
    this.scene.fog = new THREE.Fog(theme.bg, 12, 46);
  }

  // A closed solid: drawn as a translucent fill (hides lines behind it) plus its hard edges.
  solid(geo: THREE.BufferGeometry) {
    this.layer.solids.push(geo);
  }

  // A volume that hides what's behind it but draws no edges of its own (foliage, cloud).
  mass(geo: THREE.BufferGeometry) {
    this.layer.masses.push(geo);
  }

  box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
    this.solid(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
  }

  seg(a: P3, b: P3) {
    this.layer.fine.push(...a, ...b);
  }

  line(points: P3[], closed = false) {
    for (let i = 1; i < points.length; i++) this.seg(points[i - 1], points[i]);
    if (closed && points.length > 2) this.seg(points[points.length - 1], points[0]);
  }

  edge(points: P3[], closed = false) {
    for (let i = 1; i < points.length; i++) this.layer.bold.push(...points[i - 1], ...points[i]);
    if (closed) this.layer.bold.push(...points[points.length - 1], ...points[0]);
  }

  // A line material that follows the accent (for geometry built by hand).
  ink(opacity: number) {
    const m = new THREE.LineBasicMaterial({ color: this.theme.ink, transparent: true, opacity, fog: true });
    this.inks.push(m);
    return m;
  }

  // A fill material: the background lifted `mix` of the way toward the accent.
  fill(mix = 0.035, opacity = 0.85) {
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity,
      depthWrite: false,
      fog: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      side: THREE.DoubleSide,
    });
    this.fills.push({ mat, mix });
    return mat;
  }

  // Runs every frame with the time in seconds.
  every(fn: (t: number) => void) {
    this.movers.push({ fn });
  }

  // A glowing pulse that runs along a curve: a thin bright core plus a wide soft halo.
  current(points: P3[], radius: number, repeat: number, speed: number, offset: number, base = 0.75, closed = false) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      closed,
      "catmullrom",
      0,
    );
    const uniforms = () => ({
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uTime: { value: 0 },
      uColor: { value: this.theme.ink },
      uBg: { value: this.theme.bg },
      uOffset: { value: offset },
      uRepeat: { value: repeat },
      uSpeed: { value: speed },
      uBase: { value: base },
    });
    const core = new THREE.ShaderMaterial({
      uniforms: uniforms(),
      fog: true,
      vertexShader: CURRENT_VERT,
      fragmentShader: `${CURRENT_HEAD} void main(){ float b = band(vUv.x);
        gl_FragColor = vec4(mix(mix(uColor * uBase, vec3(0.95, 1.0, 0.98), b), uBg, fogAmount()), 1.0); }`,
    });
    const halo = new THREE.ShaderMaterial({
      uniforms: uniforms(),
      fog: true,
      vertexShader: CURRENT_VERT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fragmentShader: `${CURRENT_HEAD} void main(){ float e = 1.0 - abs(vUv.y - 0.5) * 2.0; float b = band(vUv.x);
        gl_FragColor = vec4(uColor, (0.05 + b * 0.9) * e * e * (1.0 - fogAmount())); }`,
    });
    this.currentMats.push(core, halo);
    const segments = Math.max(24, Math.min(2000, Math.round((curve.getLength() / radius) * 0.6)));
    this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, 6, closed), core));
    this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.ceil(segments / 2), radius * 6, 8, closed), halo));
  }

  // Blinking lights. rate < 9: slow breathing; rate >= 9: busy flicker (disk/network activity).
  lights(points: P3[], size: number, rate: (i: number) => number) {
    const geo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
    geo.setAttribute("aPhase", new THREE.Float32BufferAttribute(points.map(() => Math.random()), 1));
    geo.setAttribute("aRate", new THREE.Float32BufferAttribute(points.map((_, i) => rate(i)), 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uTime: { value: 0 },
        uSize: { value: size },
        uColor: { value: this.theme.ink },
      },
      fog: true,
      vertexShader: BLINK_VERT,
      fragmentShader: BLINK_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.currentMats.push(mat);
    const pts = new THREE.Points(geo, mat);
    pts.renderOrder = 3;
    this.scene.add(pts);
  }

  grid(size: number, divisions: number, y = 0, opacity = 0.06) {
    const grid = new THREE.GridHelper(size, divisions);
    grid.position.y = y;
    const mat = grid.material as THREE.LineBasicMaterial;
    mat.transparent = true;
    mat.opacity = opacity;
    mat.vertexColors = false;
    this.grids.push(mat);
    this.scene.add(grid);
  }

  // Something that moves on its own (a plane, a cable car): built as its own kit, placed every frame.
  mover(build: (k: Kit) => void, fn: (obj: THREE.Object3D, t: number) => void) {
    const sub = new Kit(this.theme);
    build(sub);
    sub.finish();
    const group = new THREE.Group();
    group.add(...sub.scene.children);
    this.inks.push(...sub.inks);
    this.fills.push(...sub.fills);
    this.grids.push(...sub.grids);
    this.currentMats.push(...sub.currentMats);
    this.movers.push(...sub.movers);
    this.scene.add(group);
    this.movers.push({ fn: (t) => fn(group, t) });
    return group;
  }

  // Rolling ground: a heightfield with ridge lines every few rows so the shape reads in line art.
  terrain(
    x0: number,
    x1: number,
    z0: number,
    z1: number,
    height: (x: number, z: number) => number,
    step = 0.5,
    solid = true,
    every = 4,
  ) {
    const nx = Math.max(2, Math.round((x1 - x0) / step));
    const nz = Math.max(2, Math.round((z1 - z0) / step));
    const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz)
      .rotateX(-Math.PI / 2)
      .translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, Math.max(0, height(pos.getX(i), pos.getZ(i))));
    if (solid) this.solid(geo);
    for (let j = 0; j <= nz; j += every) {
      const z = z0 + ((z1 - z0) * j) / nz;
      const pts: P3[] = [];
      for (let i = 0; i <= nx; i++) {
        const x = x0 + ((x1 - x0) * i) / nx;
        pts.push([x, Math.max(0, height(x, z)) + step * 0.01, z]);
      }
      this.line(pts);
    }
  }

  finish() {
    const { solids, masses, fine, bold } = this.layer;

    if (solids.length || masses.length) {
      const flat = [...solids, ...masses].map((g) => {
        const geo = g.index ? g.toNonIndexed() : g;
        return new THREE.BufferGeometry().setAttribute("position", geo.getAttribute("position"));
      });
      const merged = mergeGeometries(flat)!;
      // Shade by height: darker at the base, so tall shapes read as volumes.
      const pos = merged.getAttribute("position");
      let lo = Infinity;
      let hi = -Infinity;
      for (let i = 0; i < pos.count; i++) {
        lo = Math.min(lo, pos.getY(i));
        hi = Math.max(hi, pos.getY(i));
      }
      const colors = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) colors.fill(0.75 + 0.25 * ((pos.getY(i) - lo) / (hi - lo || 1)), i * 3, i * 3 + 3);
      merged.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const fill = this.fill();
      fill.vertexColors = true;
      const mesh = new THREE.Mesh(merged, fill);
      mesh.renderOrder = 2;
      this.scene.add(mesh);

      if (solids.length) {
        const edges = mergeGeometries(solids.map((g) => new THREE.EdgesGeometry(g, 20)))!;
        this.scene.add(new THREE.LineSegments(edges, this.ink(0.75)));
      }
    }

    const lines = (data: number[], opacity: number) => {
      if (!data.length) return;
      const geo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(data, 3));
      this.scene.add(new THREE.LineSegments(geo, this.ink(opacity)));
    };
    lines(fine, 0.3);
    lines(bold, 0.75);
    this.layer = { solids: [], masses: [], fine: [], bold: [] };
    this.tick(0);
  }

  // Follow the accent and the background, and run whatever moves.
  tick(t: number) {
    for (const { mat, mix } of this.fills) mat.color.copy(this.theme.bg).lerp(this.theme.ink, mix);
    for (const m of this.inks) m.color.copy(this.theme.ink);
    for (const m of this.grids) m.color.copy(this.theme.ink);
    for (const m of this.currentMats) m.uniforms.uTime.value = t;
    for (const { fn } of this.movers) fn(t);
  }
}

/* ── Shared pieces ─────────────────────────────────────────────────────────── */

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A solid stretched between two points (posts, struts, trunks).
export function rod(a: P3, b: P3, r0: number, r1 = r0, sides = 8) {
  const from = new THREE.Vector3(...a);
  const to = new THREE.Vector3(...b);
  const dir = to.clone().sub(from);
  const geo = new THREE.CylinderGeometry(r1, r0, dir.length(), sides, 1, true).translate(0, dir.length() / 2, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return geo.applyQuaternion(q).translate(...a);
}

export const ring = (n: number, fn: (a: number) => P3) =>
  Array.from({ length: n }, (_, i) => fn((i / n) * Math.PI * 2));

// Rectangle outline on an axis-aligned face. `axis` is the face normal.
export function rect(k: Kit, axis: "x" | "z", at: number, a0: number, a1: number, y0: number, y1: number) {
  const p = (a: number, y: number): P3 => (axis === "z" ? [a, y, at] : [at, y, a]);
  k.line([p(a0, y0), p(a1, y0), p(a1, y1), p(a0, y1)], true);
}

// A palm: a curved, ringed trunk and a crown of arching fronds with leaflets.
export function palm(
  k: Kit,
  base: P3,
  height: number,
  seed: number,
  opts: { lean?: number; fronds?: number; reach?: number; imperial?: boolean } = {},
) {
  const rand = mulberry(seed);
  const lean = opts.lean ?? 0.08 + rand() * 0.12;
  const heading = rand() * Math.PI * 2;
  const reach = opts.reach ?? height * 0.32;
  const trunk: P3[] = [];
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const off = lean * height * u * u;
    trunk.push([base[0] + Math.cos(heading) * off, base[1] + height * u, base[2] + Math.sin(heading) * off]);
  }
  const r0 = opts.imperial ? height * 0.022 : height * 0.03;
  for (let i = 1; i <= N; i++) {
    const u = i / N;
    const bulge = opts.imperial ? 1 + 0.35 * Math.exp(-(((u - 0.15) / 0.12) ** 2)) : 1;
    k.solid(rod(trunk[i - 1], trunk[i], r0 * bulge * lerp(1, 0.7, u - 0.1), r0 * lerp(1, 0.7, u), 7));
  }
  // Ring scars up the trunk.
  const rings = Math.round(height / (opts.imperial ? 0.9 : 0.45));
  for (let j = 1; j < rings; j++) {
    const u = j / rings;
    const f = u * N;
    const i = Math.min(N - 1, Math.floor(f));
    const c = trunk[i].map((v, d) => lerp(v, trunk[i + 1][d], f - i)) as P3;
    const r = r0 * lerp(1, 0.7, u) * 1.06;
    k.line(ring(8, (a) => [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r]), true);
  }
  const top = trunk[N];
  if (opts.imperial) {
    // The smooth green crownshaft of the imperial palm.
    k.solid(rod(top, [top[0], top[1] + height * 0.12, top[2]], r0 * 0.75, r0 * 0.62, 8));
    top[1] += height * 0.12;
  }
  k.solid(new THREE.SphereGeometry(r0 * 1.3, 8, 6).translate(...top));

  const fronds = opts.fronds ?? 14;
  for (let f = 0; f < fronds; f++) {
    const a = (f / fronds) * Math.PI * 2 + rand() * 0.4;
    const rise = lerp(-0.4, 0.9, rand());
    const len = reach * lerp(0.75, 1.1, rand());
    const pts: P3[] = [];
    const S = 10;
    for (let s = 0; s <= S; s++) {
      const u = s / S;
      const out = len * u;
      const y = len * (rise * u - 1.1 * u * u * (1 - rise * 0.3));
      pts.push([top[0] + Math.cos(a) * out, top[1] + y, top[2] + Math.sin(a) * out]);
    }
    k.edge(pts);
    // Leaflets hanging off both sides.
    for (let s = 1; s < S; s++) {
      const u = s / S;
      const [x, y, z] = pts[s];
      const w = len * 0.22 * Math.sin(Math.PI * Math.min(1, u * 1.15));
      for (const side of [-1, 1]) {
        const px = -Math.sin(a) * side;
        const pz = Math.cos(a) * side;
        k.seg([x, y, z], [x + px * w + Math.cos(a) * w * 0.3, y - w * 0.55, z + pz * w + Math.sin(a) * w * 0.3]);
      }
    }
  }
}

// A broadleaf tree: forked trunk and branches, and a canopy of clumps drawn as scribbled leaves
// over a soft mass that hides what's behind.
export function tree(k: Kit, base: P3, height: number, spread: number, seed: number) {
  const rand = mulberry(seed);
  const [x, y, z] = base;
  const fork: P3 = [x, y + height * 0.38, z];
  k.solid(rod(base, fork, height * 0.045, height * 0.035, 7));
  const clumps = 7 + Math.floor(rand() * 4);
  for (let i = 0; i < clumps; i++) {
    const a = (i / clumps) * Math.PI * 2 + rand();
    const d = spread * lerp(0.15, 0.6, rand());
    const c: P3 = [x + Math.cos(a) * d, y + height * lerp(0.62, 0.92, rand()), z + Math.sin(a) * d];
    k.solid(rod(fork, [lerp(fork[0], c[0], 0.8), lerp(fork[1], c[1], 0.8), lerp(fork[2], c[2], 0.8)], height * 0.025, height * 0.01, 5));
    const r = spread * lerp(0.3, 0.46, rand());
    k.mass(new THREE.IcosahedronGeometry(r * 0.92, 2).scale(1, 0.78, 1).translate(...c));
    const leaves = Math.round(r * r * 22);
    for (let l = 0; l < leaves; l++) {
      // A point on (or just inside) the clump's surface, and a short stroke through it.
      const u = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const depth = 0.8 + 0.2 * Math.sqrt(rand());
      const p: P3 = [c[0] + s * Math.cos(t) * r * depth, c[1] + u * r * 0.78 * depth, c[2] + s * Math.sin(t) * r * depth];
      const len = r * lerp(0.05, 0.11, rand());
      const ang = rand() * Math.PI;
      k.seg(p, [p[0] + Math.cos(ang) * len, p[1] - len * 0.5 * rand(), p[2] + Math.sin(ang) * len]);
    }
  }
}

/* ── Framing ───────────────────────────────────────────────────────────────── */

// Where a subject sits horizontally (in NDC) so it shows beside the 680px text column, not under it.
export function sideX(width: number) {
  if (width < 1000) return 0.82;
  const besideColumn = 340 + (width / 2 - 340) * 0.5;
  return besideColumn / (width / 2);
}

export interface View {
  eye: P3;
  target: P3; // lands at (screenX, screenY)
  fov: number; // vertical, degrees
  screenX?: number;
  screenY?: number;
  fogNear: number;
  fogFar: number;
  orbit?: number; // distance to the point the drift orbits (default: the target's distance)
}

// Stand the camera at `eye`, turn it so `target` lands at (screenX, screenY), and return the point
// at the center of the screen (the drift orbits around it).
export function shoot(camera: THREE.PerspectiveCamera, scene: THREE.Scene, v: View) {
  camera.fov = v.fov;
  camera.updateProjectionMatrix();
  const t = Math.tan(THREE.MathUtils.degToRad(v.fov / 2));
  const eye = new THREE.Vector3(...v.eye);
  const target = new THREE.Vector3(...v.target);
  camera.position.copy(eye);
  camera.up.set(0, 1, 0);
  camera.lookAt(target);
  camera.rotateY(Math.atan((v.screenX ?? 0) * t * camera.aspect));
  camera.rotateX(-Math.atan((v.screenY ?? 0) * t));
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const fog = scene.fog as THREE.Fog;
  fog.near = v.fogNear;
  fog.far = v.fogFar;
  return eye.addScaledVector(forward, v.orbit ?? target.distanceTo(camera.position));
}
