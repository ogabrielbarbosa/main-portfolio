import * as THREE from "three";

// Full-screen pass over the rendered scene: signal glitches, a slow scan sweep, and the dissolve where
// the drawing breaks into 0s and 1s that rain away (or rain in when the next scene resolves).
const FRAGMENT = /* glsl */ `
  uniform sampler2D tScene, tDigits;
  uniform vec2 uRes;
  uniform vec3 uBg, uInk;
  uniform float uTime, uGlitch, uProgress, uDir, uCell, uSeed, uSweep, uSweepY;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec3 scene(vec2 uv) { return texture2D(tScene, clamp(uv, 0.0, 1.0)).rgb; }
  float inkOf(vec3 c) { return clamp(length(c - uBg) * 2.5, 0.0, 1.0); }

  void main() {
    vec2 uv = vUv;

    // Sweep: a soft band that wobbles the picture a little as it passes.
    float band = 0.0;
    if (uSweep > 0.0) {
      float d = (vUv.y - uSweepY) / 0.07;
      band = uSweep * exp(-d * d);
      uv.x += band * (sin(vUv.y * 55.0 + uTime * 4.0) * 0.0024
        + (hash(vec2(floor(gl_FragCoord.y * 0.5), floor(uTime * 30.0))) - 0.5) * 0.0012);
    }

    // Glitch: horizontal bands torn sideways, stepping 24 times a second.
    float g = uGlitch;
    if (g > 0.0) {
      float frame = floor(uTime * 24.0);
      float rows = mix(10.0, 46.0, hash(vec2(frame, 1.7)));
      float row = floor(uv.y * rows);
      float torn = step(1.0 - 0.4 * g, hash(vec2(row, frame)));
      uv.x += torn * (hash(vec2(frame, row)) - 0.5) * 0.08 * g;
      uv.x += (hash(vec2(floor(gl_FragCoord.y * 0.5), frame)) - 0.5) * 0.0012 * g;
    }

    // Chromatic fringe, half blended back in.
    float split = 0.0028 * g + 0.0012 * band;
    vec3 col = scene(uv);
    col = mix(col, vec3(scene(uv + vec2(split, 0.0)).r, col.g, scene(uv - vec2(split, 0.0)).b), 0.6);
    col = uBg + (col - uBg) * (1.0 + 0.3 * band);
    if (g > 0.0) {
      col = mix(col, uBg, 0.22 * g * step(0.5, fract(gl_FragCoord.y / 3.0)));
      col = uBg + (col - uBg) * (1.0 + 0.5 * g * (hash(vec2(floor(uTime * 24.0), 9.1)) - 0.5));
    }

    float p = uProgress;
    if (p > 0.0) {
      // Lines vanish cell by cell; the haze between them fades evenly.
      vec2 here = floor(gl_FragCoord.xy / uCell);
      float gone = smoothstep(0.0, 0.18, p - 0.3 * hash(here + uSeed));
      col = mix(col, uBg, max(gone * smoothstep(0.15, 0.5, inkOf(col)), smoothstep(0.15, 0.65, p)));

      // Each column of digits falls at its own speed, speeding up as it goes.
      float column = floor(gl_FragCoord.x / uCell);
      float speed = mix(0.35, 1.0, hash(vec2(column, uSeed)));
      float travel = pow(clamp((p - 0.2) / 0.8, 0.0, 1.0), 1.8) * speed * uRes.y * 0.55;
      vec2 from = gl_FragCoord.xy + vec2(0.0, travel * uDir);
      vec2 cell = floor(from / uCell);
      vec2 inCell = fract(from / uCell);

      // How much drawing the digit's source cell held (max of a few taps, so thin lines count).
      vec2 base = cell * uCell / uRes, span = uCell / uRes;
      float ink = 0.0;
      vec3 tint = uInk;
      for (int i = 0; i < 5; i++) {
        vec2 o = i == 0 ? vec2(0.5) : vec2(i == 1 || i == 3 ? 0.2 : 0.8, i < 3 ? 0.2 : 0.8);
        vec3 c = scene(base + o * span);
        float d = inkOf(c);
        if (d > ink) { ink = d; tint = c; }
      }

      float h = hash(cell + uSeed);
      float shown = smoothstep(0.0, 0.18, p - 0.3 * h) * (1.0 - smoothstep(0.55 + 0.3 * h, 0.8 + 0.2 * h, p));
      float bit = step(0.5, hash(cell + floor(uTime * 7.0 + h * 13.0)));
      float glyph = texture2D(tDigits, vec2((bit + inCell.x) * 0.5, inCell.y)).a;
      col = mix(col, mix(tint, uInk, 0.55), glyph * ink * shown);
    }

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// "0" and "1" side by side, sampled per cell by the shader.
function digitTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.font = `500 ${32 * 0.78}px 'Geist Mono', ui-monospace, Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("0", 16, 17);
  ctx.fillText("1", 48, 17);
  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

export interface PostState {
  time: number;
  glitch: number;
  progress: number;
  dir: number;
  sweep: number;
  sweepY: number;
  bg: THREE.Color;
  ink: THREE.Color;
}

export function createPost(renderer: THREE.WebGLRenderer) {
  const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4 });
  const digits = digitTexture();
  document.fonts?.ready.then(() => {
    digits.image = digitTexture().image;
    digits.needsUpdate = true;
  });
  const uniforms = {
    tScene: { value: target.texture },
    tDigits: { value: digits },
    uRes: { value: new THREE.Vector2() },
    uBg: { value: new THREE.Color() },
    uInk: { value: new THREE.Color() },
    uTime: { value: 0 },
    uGlitch: { value: 0 },
    uSweep: { value: 0 },
    uSweepY: { value: 0 },
    uProgress: { value: 0 },
    uDir: { value: 1 },
    uCell: { value: 10 },
    uSeed: { value: 0 },
  };
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: FRAGMENT,
      depthTest: false,
      depthWrite: false,
    }),
  );
  quad.frustumCulled = false;
  const screen = new THREE.Scene().add(quad);
  const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const size = new THREE.Vector2();

  return {
    reseed() {
      uniforms.uSeed.value = Math.random() * 100;
    },
    render(scene: THREE.Scene, camera: THREE.Camera, s: PostState) {
      // Nothing to post-process: draw straight to the screen.
      if (s.glitch <= 0 && s.progress <= 0 && s.sweep <= 0) {
        renderer.render(scene, camera);
        return;
      }
      renderer.getDrawingBufferSize(size);
      if (target.width !== size.x || target.height !== size.y) target.setSize(size.x, size.y);
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      uniforms.uRes.value.copy(size);
      uniforms.uCell.value = Math.round(11 * renderer.getPixelRatio());
      uniforms.uTime.value = s.time;
      uniforms.uGlitch.value = s.glitch;
      uniforms.uSweep.value = s.sweep;
      uniforms.uSweepY.value = s.sweepY;
      uniforms.uProgress.value = s.progress;
      uniforms.uDir.value = s.dir;
      uniforms.uBg.value.copy(s.bg);
      uniforms.uInk.value.copy(s.ink);
      renderer.render(screen, flat);
    },
  };
}
