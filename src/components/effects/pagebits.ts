/**
 * Page transition: every visible character of the page you leave glitches, shatters into glowing
 * 0/1 bits, and those bits fly along curved paths into the characters of the page you arrive at,
 * which flicker in through scrambled glyphs in the accent color before settling. Panels (anything with
 * a backdrop blur) just fade. On first load the page assembles itself the same way.
 *
 * Text stays in the DOM the whole time (made transparent with .tx-hide); a canvas on top draws it.
 */

const ROOTS = "main, footer.site";
const SCRAMBLE = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789#$%&*+=<>/";
const FRINGE = ["rgb(255 70 110)", "rgb(70 200 255)"];

const FADE_OUT = 110; // ms a glyph takes to break into bits
const PRE_GLITCH = 130; // ms of glitching before it breaks
const SETTLE = 230; // ms a new glyph takes to settle
const LEAVE_DELAY = 400; // ms the old page plays before the new one swaps in

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const speedCurve = (x: number) => (x < 0.5 ? 12 * x * x : 3 * (2 - 2 * x) ** 2) / 3;
const hash = (x: number) => {
  x = Math.imul(x ^ (x >>> 15), 739982445);
  x = Math.imul(x ^ (x >>> 12), 695872825);
  return (x ^ (x >>> 15)) >>> 0;
};
const rand = (x: number) => hash(x) / 4294967296;

type Rect = { left: number; top: number; right: number; bottom: number; width?: number };
const onScreen = (r: Rect, w: number, h: number) => (r.width ?? 1) > 0 && r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;

interface Pic {
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, color?: string) => void;
  cells: [number, number][];
}

interface Glyph {
  ch: string;
  font: string;
  color: string;
  alpha: number;
  x: number;
  y: number; // baseline for text, top for pictures
  top: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  word: number;
  at: number; // when it breaks (old) or appears (new)
  pic?: Pic;
}

interface Bit {
  x0: number;
  y0: number;
  seed: number;
  hot: boolean;
  bright: number;
  clone: boolean; // a copy that fades in where a reused bit already left from
  g0?: Glyph; // the glyph it came out of
  g1?: Glyph; // the glyph it flies into
  tx: number;
  ty: number;
  bx: number;
  by: number;
  departAt: number;
  dur: number;
}

interface Run {
  bits: Bit[];
  olds: Glyph[];
  news: Glyph[];
  anims: Animation[];
  swapped: boolean;
  swapAt: number;
  scrollAt: number;
  endAt: number;
  accent: string;
  sprites: Sprites;
  seed: number;
  bend: number;
}

interface Sprites {
  dim: HTMLCanvasElement[];
  hot: HTMLCanvasElement[];
  size: number;
}

// Pre-rendered glowing "0" and "1".
function makeSprites(color: string): Sprites {
  const dpr = Math.min(devicePixelRatio, 2);
  const px = 11 * dpr;
  const size = Math.ceil(px * 2.4);
  const draw = (ch: string, hot: boolean) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    ctx.font = `500 ${px}px 'Geist Mono', ui-monospace, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ctx.shadowColor = color;
    ctx.shadowBlur = px * (hot ? 0.9 : 0.6);
    ctx.globalAlpha = 0.6;
    ctx.fillText(ch, size / 2, size / 2);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.fillText(ch, size / 2, size / 2);
    if (hot) {
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.6;
      ctx.fillText(ch, size / 2, size / 2);
    }
    return c;
  };
  return { dim: ["0", "1"].map((d) => draw(d, false)), hot: ["0", "1"].map((d) => draw(d, true)), size: size / dpr };
}

export interface PageBits {
  leave: (source: Element | null) => void;
  arrive: () => void;
  cancel: () => void;
}

export function startPageBits(): PageBits | null {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const canvas = document.createElement("canvas");
  canvas.className = "pagebits";
  canvas.setAttribute("aria-hidden", "true");
  canvas.hidden = true;
  document.documentElement.append(canvas);
  const ctx = canvas.getContext("2d")!;
  const scratch = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

  let run: Run | null = null;
  let raf = 0;

  /* ── Measuring ── */

  const metricsCache = new Map<string, { ascent: number; height: number }>();
  function metrics(font: string) {
    let m = metricsCache.get(font);
    if (!m) {
      ctx.font = font;
      const t = ctx.measureText("Hg");
      m = { ascent: t.fontBoundingBoxAscent, height: t.fontBoundingBoxAscent + t.fontBoundingBoxDescent };
      metricsCache.set(font, m);
    }
    return m;
  }

  // Draw something on the scratch canvas and return the ink-weighted centers of a grid of cells
  // over it: that's where the bits come from (and land), so they trace the actual letter shapes.
  function inkCells(w: number, h: number, cell: number, paint: () => void): [number, number][] {
    if (scratch.canvas.width < w || scratch.canvas.height < h) {
      scratch.canvas.width = Math.max(w, scratch.canvas.width);
      scratch.canvas.height = Math.max(h, scratch.canvas.height);
    }
    scratch.clearRect(0, 0, w, h);
    paint();
    const data = scratch.getImageData(0, 0, w, h).data;
    let x0 = w;
    let y0 = h;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] < 40) continue;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    if (x1 < 0) return [];
    const nx = Math.max(1, Math.round((x1 - x0 + 1) / cell));
    const ny = Math.max(1, Math.round((y1 - y0 + 1) / cell));
    const cw = (x1 - x0 + 1) / nx;
    const ch = (y1 - y0 + 1) / ny;
    const weight = new Float64Array(nx * ny);
    const sx = new Float64Array(nx * ny);
    const sy = new Float64Array(nx * ny);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const a = data[(y * w + x) * 4 + 3];
        if (!a) continue;
        const i = Math.min(nx - 1, Math.floor((x - x0) / cw)) + Math.min(ny - 1, Math.floor((y - y0) / ch)) * nx;
        weight[i] += a;
        sx[i] += a * x;
        sy[i] += a * y;
      }
    const max = Math.max(...weight);
    const out: [number, number][] = [];
    weight.forEach((wt, i) => {
      if (wt >= max * 0.25) out.push([sx[i] / wt, sy[i] / wt]);
    });
    return out;
  }

  const textCellsCache = new Map<string, [number, number][]>();
  function textCells(font: string, ch: string) {
    const key = `${font}\n${ch}`;
    const hit = textCellsCache.get(key);
    if (hit) return hit;
    const m = metrics(font);
    scratch.font = font;
    const w = Math.ceil(scratch.measureText(ch).width) + 4;
    const h = Math.ceil(m.height) + 4;
    const cells = inkCells(w, h, 12, () => {
      scratch.font = font;
      scratch.fillText(ch, 2, 2 + m.ascent);
    });
    const out: [number, number][] = cells.length
      ? cells.map(([x, y]) => [x - 2, y - 2 - m.ascent])
      : [[(w - 4) / 2, m.height / 2 - m.ascent]];
    textCellsCache.set(key, out);
    return out;
  }

  const cellSize = (w: number, h: number) => Math.max(12, Math.sqrt((w * h) / 150));

  // Icons: redraw their shapes from the SVG markup.
  function svgPic(svg: SVGSVGElement, r: DOMRect): Pic | null {
    const vb = svg.viewBox.baseVal;
    const vw = vb?.width || r.width;
    const vh = vb?.height || r.height;
    const scale = Math.min(r.width / vw, r.height / vh);
    const ox = (r.width - vw * scale) / 2 - (vb?.x ?? 0) * scale;
    const oy = (r.height - vh * scale) / 2 - (vb?.y ?? 0) * scale;
    const num = (el: Element, attr: string) => Number(el.getAttribute(attr) ?? 0);
    const parts: { path: Path2D; fill: string; stroke: string; width: number; rule: CanvasFillRule }[] = [];
    for (const el of svg.querySelectorAll("path, circle, rect, line, polyline, polygon")) {
      const path = new Path2D(el.tagName === "path" ? (el.getAttribute("d") ?? "") : undefined);
      if (el.tagName === "circle") path.arc(num(el, "cx"), num(el, "cy"), num(el, "r"), 0, Math.PI * 2);
      else if (el.tagName === "rect") path.rect(num(el, "x"), num(el, "y"), num(el, "width"), num(el, "height"));
      else if (el.tagName === "line") {
        path.moveTo(num(el, "x1"), num(el, "y1"));
        path.lineTo(num(el, "x2"), num(el, "y2"));
      } else if (el.tagName !== "path") {
        const pts = (el.getAttribute("points") ?? "").trim().split(/[\s,]+/).map(Number);
        for (let i = 0; i + 1 < pts.length; i += 2) path[i ? "lineTo" : "moveTo"](pts[i], pts[i + 1]);
        if (el.tagName === "polygon") path.closePath();
      }
      const cs = getComputedStyle(el);
      parts.push({
        path,
        fill: cs.fill,
        stroke: cs.stroke,
        width: parseFloat(cs.strokeWidth) || 1,
        rule: cs.fillRule === "evenodd" ? "evenodd" : "nonzero",
      });
    }
    if (!parts.length) return null;
    const draw = (c: CanvasRenderingContext2D, x: number, y: number, color?: string) => {
      c.save();
      c.translate(x + ox, y + oy);
      c.scale(scale, scale);
      for (const p of parts) {
        if (p.fill !== "none") {
          c.fillStyle = color ?? p.fill;
          c.fill(p.path, p.rule);
        }
        if (p.stroke !== "none") {
          c.strokeStyle = color ?? p.stroke;
          c.lineWidth = p.width;
          c.stroke(p.path);
        }
      }
      c.restore();
    };
    const w = Math.ceil(r.width) + 4;
    const h = Math.ceil(r.height) + 4;
    const cells = inkCells(w, h, cellSize(r.width, r.height), () => draw(scratch, 2, 2, "#000"));
    return {
      draw,
      cells: cells.length ? cells.map(([x, y]) => [x - 2, y - 2]) : [[r.width / 2, r.height / 2]],
    };
  }

  // Photos: drawn with their object-fit: cover crop and rounded corners.
  function imgPic(img: HTMLImageElement, r: DOMRect, cs: CSSStyleDeclaration): Pic | null {
    if (!img.complete || !img.naturalWidth) return null;
    const radius = cs.borderRadius.endsWith("%")
      ? (parseFloat(cs.borderRadius) / 100) * Math.min(r.width, r.height)
      : parseFloat(cs.borderRadius) || 0;
    // Cover-fit in destination space and let the clip crop it. A source rect (9-arg drawImage) is
    // read in raw bitmap pixels by Safari but in density-corrected pixels elsewhere, so with srcset
    // 2x/3x images iOS drew a zoomed-in crop.
    const cover = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
    const dw = img.naturalWidth * cover;
    const dh = img.naturalHeight * cover;
    const draw = (c: CanvasRenderingContext2D, x: number, y: number, color?: string) => {
      c.save();
      c.beginPath();
      c.roundRect(x, y, r.width, r.height, radius);
      c.clip();
      if (color) {
        c.fillStyle = color;
        c.fill();
      } else c.drawImage(img, x + (r.width - dw) / 2, y + (r.height - dh) / 2, dw, dh);
      c.restore();
    };
    const w = Math.ceil(r.width) + 4;
    const h = Math.ceil(r.height) + 4;
    const cells = inkCells(w, h, cellSize(r.width, r.height), () => draw(scratch, 2, 2, "#000"));
    return { draw, cells: cells.map(([x, y]) => [x - 2, y - 2]) };
  }

  // Every visible character (and picture) inside the roots, with where and how it's drawn.
  function collect(roots: Element[]): Glyph[] {
    const vw = document.documentElement.clientWidth;
    const vh = innerHeight;
    const range = document.createRange();
    const styles = new Map<Element, { font: string; color: string; alpha: number; upper: boolean } | null>();
    const out: Glyph[] = [];
    let word = 0;

    for (const root of roots) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node instanceof SVGSVGElement || node instanceof HTMLImageElement) {
          // The profile photo stays put: it never breaks into bits or flies in.
          if (node instanceof HTMLImageElement && node.classList.contains("avatar")) continue;
          const r = node.getBoundingClientRect();
          const cs = getComputedStyle(node);
          if (!onScreen(r, vw, vh) || cs.visibility !== "visible") continue;
          const pic = node instanceof HTMLImageElement ? imgPic(node, r, cs) : svgPic(node, r);
          if (!pic) continue;
          node.classList.add("tx-pic");
          out.push({
            ch: "",
            font: "",
            color: "",
            alpha: Number(cs.opacity),
            x: r.left,
            y: r.top,
            top: r.top,
            w: r.width,
            h: r.height,
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
            word: word++,
            at: -Infinity,
            pic,
          });
          continue;
        }
        if (node.nodeType !== Node.TEXT_NODE) continue;
        const text = node as Text;
        if (!text.data.trim() || text.parentElement?.closest("svg")) continue;
        range.selectNodeContents(text);
        if (!onScreen(range.getBoundingClientRect(), vw, vh)) continue;

        const parent = text.parentElement!;
        if (!styles.has(parent)) {
          const cs = getComputedStyle(parent);
          styles.set(
            parent,
            cs.visibility !== "visible"
              ? null
              : {
                  font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
                  color: cs.color,
                  alpha: Number(cs.opacity),
                  upper: cs.textTransform === "uppercase",
                },
          );
        }
        const style = styles.get(parent);
        if (!style) continue;
        const m = metrics(style.font);
        for (const { segment, index } of segmenter.segment(text.data)) {
          if (!segment.trim()) {
            word++;
            continue;
          }
          range.setStart(text, index);
          range.setEnd(text, index + segment.length);
          const r = range.getBoundingClientRect();
          if (!onScreen(r, vw, vh)) continue;
          out.push({
            ch: style.upper ? segment.toUpperCase() : segment,
            font: style.font,
            color: style.color,
            alpha: style.alpha,
            x: r.left,
            y: r.top + (r.height - m.height) / 2 + m.ascent,
            top: r.top,
            w: r.width,
            h: r.height,
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
            word,
            at: -Infinity,
          });
        }
        word++;
      }
    }
    return out;
  }

  const cellsOf = (g: Glyph) => (g.pic ? g.pic.cells : textCells(g.font, g.ch));

  // Blurred panels can't be redrawn on the canvas; they fade instead. Only the outermost ones.
  function panels(roots: Element[]) {
    const vw = document.documentElement.clientWidth;
    const vh = innerHeight;
    const blurred = (el: Element) => getComputedStyle(el).backdropFilter !== "none";
    const out: Element[] = [];
    const walk = (el: Element) => {
      for (const child of el.children) {
        if (!onScreen(child.getBoundingClientRect(), vw, vh)) continue;
        if (blurred(child)) out.push(child);
        else walk(child);
      }
    };
    roots.forEach(walk);
    return out;
  }

  function newBit(x: number, y: number, extra: Partial<Bit> = {}): Bit {
    const seed = Math.floor(Math.random() * 1e9);
    const hot = Math.random() < 0.12;
    return {
      x0: x,
      y0: y,
      seed,
      hot,
      bright: hot ? 1 : 0.35 + Math.random() * 0.4,
      clone: false,
      tx: x,
      ty: y,
      bx: x,
      by: y,
      departAt: Infinity,
      dur: 1,
      ...extra,
    };
  }

  function newRun(): Run {
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#5eead4";
    return {
      bits: [],
      olds: [],
      news: [],
      anims: [],
      swapped: false,
      swapAt: Infinity,
      scrollAt: scrollY,
      endAt: Infinity,
      accent,
      sprites: makeSprites(accent),
      seed: Math.floor(Math.random() * 1e9),
      bend: Math.random() < 0.5 ? 1 : -1,
    };
  }

  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio, 2);
    const w = document.documentElement.clientWidth;
    const h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const roots = () => [...document.querySelectorAll(ROOTS)];

  /* ── Drawing ── */

  function paint(g: Glyph, ch: string, x: number, y: number, color: string) {
    if (g.pic) g.pic.draw(ctx, x, y, color === g.color ? undefined : color);
    else {
      ctx.fillStyle = color;
      ctx.fillText(ch, x, y);
    }
  }

  // A glitching glyph: red/cyan ghosts either side, and thin horizontal slices knocked sideways.
  function glitchy(g: Glyph, ch: string, x: number, y: number, top: number, color: string, alpha: number, k: number, frame: number) {
    const r = run!;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha * 0.45 * k;
    paint(g, ch, x - 2.5 * k, y, FRINGE[0]);
    paint(g, ch, x + 2.5 * k, y, FRINGE[1]);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = alpha;
    paint(g, ch, x, y, color);
    for (let row = Math.floor(top / 6); row * 6 < top + g.h; row++) {
      const hsh = hash(row * 7919 + frame * 104729 + r.seed);
      if ((hsh & 255) > 80) continue;
      const shift = (((hsh >>> 8) & 255) / 255 - 0.5) * 14 * k;
      ctx.clearRect(x - 1, row * 6, g.w + 2, 6);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, row * 6, canvas.width, 6);
      ctx.clip();
      paint(g, ch, x + shift, y, color);
      ctx.restore();
    }
  }

  function drawBit(b: Bit, digit: number, x: number, y: number, scale: number, alpha: number) {
    if (alpha <= 0.01) return;
    const s = run!.sprites;
    const size = s.size * scale;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage((b.hot ? s.hot : s.dim)[digit], x - size / 2, y - size / 2, size, size);
  }

  function draw(t: number) {
    const r = run!;
    const vw = document.documentElement.clientWidth;
    const vh = innerHeight;
    ctx.clearRect(0, 0, vw, vh);
    const scroll = r.swapped ? r.scrollAt - scrollY : 0;
    const frame = Math.floor(t / 33);
    let font = "";
    const setFont = (f: string) => {
      if (f !== font) ctx.font = font = f;
    };

    // The page being left.
    ctx.globalCompositeOperation = "source-over";
    for (const g of r.olds) {
      const l = clamp01((t - g.at) / FADE_OUT);
      if (l >= 1) continue;
      if (!g.pic) setFont(g.font);
      const k = t < g.at - PRE_GLITCH ? 0 : t < g.at ? Math.sin((Math.PI * (t - g.at + PRE_GLITCH)) / PRE_GLITCH) : 1 - l;
      if (k > 0) glitchy(g, g.ch, g.x, g.y, g.top, l > 0 ? r.accent : g.color, g.alpha * (1 - l), k, frame);
      else {
        ctx.globalAlpha = g.alpha;
        paint(g, g.ch, g.x, g.y, g.color);
      }
    }

    // Bits, with short comet trails while they fly.
    ctx.globalCompositeOperation = "lighter";
    const trails = [new Path2D(), new Path2D(), new Path2D()];
    for (const b of r.bits) {
      const born = b.g0 ? clamp01((t - b.g0.at) / FADE_OUT) : 1;
      if (born <= 0) continue;
      const bob = Math.sin(t / 520 + (b.seed % 628) / 100);
      const moving = r.swapped && t >= b.departAt;
      const digit = hash(b.seed + Math.floor((t / 1000) * (moving ? 15 : 8) + (b.seed % 97) / 97)) & 1;
      let alpha = b.bright * born;
      if (!moving) {
        if (!b.clone) drawBit(b, digit, b.x0, b.y0 + bob, 1 + 0.6 * (1 - born), alpha);
        continue;
      }
      const d = clamp01((t - b.departAt) / b.dur);
      if (!b.g1) {
        // Nowhere to go: it drops.
        const s = (t - b.departAt) / 1000;
        drawBit(b, digit, b.x0, b.y0 + bob + 1700 * s * s, 1, alpha * (1 - d) ** 1.5);
        continue;
      }
      const landed = clamp01((t - b.g1.at) / (SETTLE * 0.4));
      if (landed >= 1) continue;
      if (b.clone) alpha *= clamp01(d / 0.3);
      const at = (u: number): [number, number] => {
        const e = easeInOut(clamp01(u));
        const n = 1 - e;
        return [
          n * n * b.x0 + 2 * n * e * b.bx + e * e * b.tx,
          n * n * (b.y0 + bob) + 2 * n * e * (b.by + scroll * e) + e * e * (b.ty + scroll),
        ];
      };
      const [x, y] = at(d);
      if (d < 1) {
        alpha *= 0.75 + 0.6 * speedCurve(d);
        let [px, py] = at(d - 0.15);
        for (let i = 0; i < 3; i++) {
          const [qx, qy] = i === 2 ? [x, y] : at(d - 0.1 + i * 0.05);
          trails[i].moveTo(px, py);
          trails[i].lineTo(qx, qy);
          [px, py] = [qx, qy];
        }
      }
      drawBit(b, digit, x, y, 1 + 0.6 * landed, alpha * (1 - landed));
    }
    ctx.strokeStyle = r.accent;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    trails.forEach((p, i) => {
      ctx.globalAlpha = [0.05, 0.11, 0.2][i];
      ctx.stroke(p);
    });

    // The page arriving: scrambled accent glyphs that settle into the real text.
    for (const g of r.news) {
      if (!r.swapped || t < g.at) continue;
      const l = clamp01((t - g.at) / SETTLE);
      const y = g.y + scroll;
      if (!g.pic) setFont(g.font);
      ctx.globalCompositeOperation = "source-over";
      if (l >= 1) {
        ctx.globalAlpha = g.alpha;
        paint(g, g.ch, g.x, y, g.color);
      } else if (l < 0.45) {
        const hsh = hash(Math.round(g.x * 7 + g.y * 13) + r.seed);
        const ch = !g.pic && hsh % 3 === 0 && l < 0.3 ? SCRAMBLE[hash(hsh + Math.floor(t / 45)) % SCRAMBLE.length] : g.ch;
        const jitter = l < 0.35 ? (rand(Math.floor(g.cy / 8) * 31 + frame + r.seed) - 0.5) * 6 * (1 - l / 0.35) : 0;
        const alpha = g.alpha * clamp01(l / 0.12);
        if (l < 0.3) glitchy(g, ch, g.x + jitter, y, g.top + scroll, r.accent, alpha, 0.6 * (1 - l / 0.3), frame);
        else {
          ctx.globalAlpha = alpha;
          paint(g, ch, g.x + jitter, y, r.accent);
        }
      } else {
        const k = clamp01((l - 0.45) / 0.55);
        ctx.globalAlpha = g.alpha * (1 - k);
        paint(g, g.ch, g.x, y, r.accent);
        ctx.globalAlpha = g.alpha * k;
        paint(g, g.ch, g.x, y, g.color);
      }
    }

    // A faint scan band rolls down the screen as the new page lands.
    const sweep = (t - r.swapAt) / 560;
    if (sweep >= 0 && sweep < 1) {
      const center = (-0.15 + 1.3 * sweep) * vh;
      const half = 70;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = r.accent;
      for (let y = Math.floor((center - half) / 3) * 3; y < center + half; y += 3) {
        const u = (y - center) / (half / 2);
        const k = Math.exp(-u * u) * Math.sin(Math.PI * sweep);
        ctx.globalAlpha = 0.025 * k;
        ctx.fillRect(0, y, vw, 3);
        ctx.globalAlpha = 0.07 * k;
        ctx.fillRect(0, y, vw, 1);
      }
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  function loop(t: number) {
    if (!run) return;
    if (run.swapped && t >= run.endAt) return finish();
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  function finish() {
    if (!run) return;
    cancelAnimationFrame(raf);
    for (const a of run.anims) a.cancel();
    document.querySelectorAll(".tx-hide").forEach((el) => el.classList.remove("tx-hide"));
    document.querySelectorAll(".tx-pic").forEach((el) => el.classList.remove("tx-pic"));
    document.documentElement.classList.remove("tx-wait");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.hidden = true;
    run = null;
  }

  /* ── Leaving ── */

  function leave(source: Element | null) {
    finish();
    if (document.hidden) return;
    const now = performance.now();
    const els = roots();
    const olds = collect(els);
    run = newRun();
    const r = run;
    const vw = document.documentElement.clientWidth;
    const src = source?.getBoundingClientRect();
    const ox = src ? src.left + src.width / 2 : vw / 2;
    const oy = src ? src.top + src.height / 2 : -innerHeight * 0.3;

    // Words break outward from what was clicked.
    const centers = new Map<number, [number, number, number]>();
    for (const g of olds) {
      const c = centers.get(g.word) ?? [0, 0, 0];
      c[0] += g.cx;
      c[1] += g.cy;
      c[2]++;
      centers.set(g.word, c);
    }
    const wordCenter = (w: number) => {
      const [x, y, n] = centers.get(w)!;
      return [x / n, y / n];
    };
    const far = Math.max(1, ...[...centers.keys()].map((w) => Math.hypot(wordCenter(w)[0] - ox, wordCenter(w)[1] - oy)));
    for (const g of olds) {
      const [cx, cy] = wordCenter(g.word);
      g.at = now + PRE_GLITCH + (Math.hypot(cx - ox, cy - oy) / far) * 240 + rand(g.word + r.seed) * 40;
      for (const [dx, dy] of cellsOf(g)) r.bits.push(newBit(g.x + dx, g.y + dy, { g0: g }));
    }
    r.olds = olds.sort((a, b) => (a.font < b.font ? -1 : 1));
    r.anims = panels(els).map((el) => {
      const b = el.getBoundingClientRect();
      const d = Math.hypot(b.left + b.width / 2 - ox, b.top + b.height / 2 - oy) / far;
      return el.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay: PRE_GLITCH / 2 + d * 110,
        duration: LEAVE_DELAY - PRE_GLITCH / 2 - 110,
        easing: "cubic-bezier(.4, 0, 1, 1)",
        fill: "both",
      });
    });

    sizeCanvas();
    canvas.hidden = false;
    draw(now);
    els.forEach((el) => el.classList.add("tx-hide"));
    // The next page renders hidden until arrive() takes over.
    document.documentElement.classList.add("tx-wait");
    raf = requestAnimationFrame(loop);
  }

  /* ── Arriving ── */

  function arrive() {
    const r = run ?? (run = newRun());
    if (canvas.hidden) {
      sizeCanvas();
      canvas.hidden = false;
      raf = requestAnimationFrame(loop);
    }
    const now = performance.now();
    const els = roots();
    els.forEach((el) => el.classList.add("tx-hide"));
    const news = collect(els);
    const vh = innerHeight;
    r.swapped = true;
    r.swapAt = now;
    r.scrollAt = scrollY;
    dispatchEvent(new Event("pageshift"));

    // Landing spots, and which old bit goes to each: in reading order, then untangled a little so
    // neighbouring paths don't cross.
    const targets: { g: Glyph; x: number; y: number }[] = [];
    for (const g of news) for (const [dx, dy] of cellsOf(g)) targets.push({ g, x: g.x + dx, y: g.y + dy });
    const pool = r.bits;
    const nb = pool.length;
    const nt = targets.length;
    const pick = targets.map((_, i) => Math.min(nb - 1, Math.floor(((i + 0.5) * nb) / nt)));
    if (nb) {
      const dist = (b: number, t: number) => Math.hypot(pool[b].x0 - targets[t].x, pool[b].y0 - targets[t].y);
      for (let pass = 0; pass < 2; pass++)
        for (let i = 0; i < nt; i++)
          for (let j = i + 1; j < Math.min(nt, i + 10); j++)
            if (dist(pick[i], i) + dist(pick[j], j) > dist(pick[j], i) + dist(pick[i], j)) [pick[i], pick[j]] = [pick[j], pick[i]];
    }
    const used = new Set<number>();
    const flying = targets.map(({ g, x, y }, i) => {
      let b: Bit;
      if (!nb) b = newBit(x, y, { clone: true });
      else if (used.has(pick[i])) b = newBit(pool[pick[i]].x0, pool[pick[i]].y0, { clone: true });
      else {
        used.add(pick[i]);
        b = pool[pick[i]];
      }
      b.g1 = g;
      b.tx = x;
      b.ty = y;
      return b;
    });

    // Timing per word: higher words go first; paths bow to one side.
    const words = new Map<number, { top: number; dist: number; n: number }>();
    for (const b of flying) {
      const w = words.get(b.g1!.word) ?? { top: Infinity, dist: 0, n: 0 };
      w.top = Math.min(w.top, b.g1!.top);
      w.dist += Math.hypot(b.tx - b.x0, b.ty - b.y0);
      w.n++;
      words.set(b.g1!.word, w);
    }
    for (const b of flying) {
      const id = b.g1!.word;
      const w = words.get(id)!;
      const wr = rand(id + r.seed);
      const br = b.hot ? 0 : rand(b.seed);
      const start = now + 20 + clamp01(w.top / vh) * 160 + wr * 40 + br * 30;
      b.departAt = Math.max(b.g0 ? b.g0.at + FADE_OUT * 0.6 : -Infinity, start);
      b.dur = 310 + Math.min(w.dist / w.n, 800) * 0.24 + rand(id * 3 + r.seed) * 60 + (br - 0.5) * 20;
      const bow = r.bend * (0.08 + wr * 0.12) + (rand(b.seed * 7) - 0.5) * 0.04;
      const dx = b.tx - b.x0;
      const dy = b.ty - b.y0;
      b.bx = (b.x0 + b.tx) / 2 - dy * bow;
      b.by = (b.y0 + b.ty) / 2 + dx * bow;
      b.g1!.at = Math.max(b.g1!.at, b.departAt + b.dur);
    }
    // Leftover bits fall away.
    pool.forEach((b, i) => {
      if (used.has(i)) return;
      b.departAt = Math.max((b.g0?.at ?? now) + FADE_OUT, now + Math.random() * 200);
      b.dur = 480;
      flying.push(b);
    });
    r.bits = flying;
    r.news = news.sort((a, b) => (a.font < b.font ? -1 : 1));
    r.endAt = Math.max(
      now + 560,
      ...news.map((g) => g.at + SETTLE),
      ...flying.filter((b) => !b.g1).map((b) => b.departAt + b.dur),
    );

    for (const el of panels(els)) {
      const top = el.getBoundingClientRect().top;
      r.anims.push(
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          delay: 60 + clamp01(top / vh) * 160,
          duration: 500,
          easing: "cubic-bezier(.2, .6, .3, 1)",
          fill: "backwards",
        }),
      );
    }
    document.documentElement.classList.remove("tx-wait", "entering");
  }

  const cancel = () => finish();
  let width = innerWidth;
  const onResize = () => {
    if (innerWidth !== width) {
      width = innerWidth;
      finish();
    }
  };
  addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", () => document.hidden && finish());

  return { leave, arrive, cancel };
}
