// Vim-style keyboard navigation: ↑↓/jk move between rows, ←→/hl within a row, g/G jump to the ends,
// "/" finds by text, Enter opens, Esc leaves. A ">" cursor and a highlighted row follow the selection,
// and the bar at the bottom shows where you are.

const SELECTOR = [
  "header.site .home",
  "header.site nav a",
  "main .intro",
  "main h1:not(.intro h1)",
  "main .lede",
  "main .kv dt",
  "main .links a",
  "main h2",
  "main .log > li",
  "main ul:not(.tags) > li",
  "main ol:not(.log) > li",
  "main p > a",
  "main article.post p",
  "footer.site a",
].join(", ");

const KEYS: Record<string, "down" | "up" | "left" | "right" | "first" | "last"> = {
  ArrowDown: "down",
  j: "down",
  ArrowUp: "up",
  k: "up",
  ArrowLeft: "left",
  h: "left",
  ArrowRight: "right",
  l: "right",
  g: "first",
  G: "last",
};

type Move = (typeof KEYS)[string];

const nameOf = (el: Element) =>
  ((el.getAttribute("aria-label") || (el as HTMLElement).innerText || "").trim().split("\n")[0] ?? "")
    .replace(/\s+/g, " ")
    .toLowerCase();

const topOf = (el: Element) => el.getBoundingClientRect().top;
const sameRow = (a: Element, b: Element) => Math.abs(topOf(a) - topOf(b)) < 8;
const linkOf = (el: Element) => (el.matches("a") ? el : el.querySelector("a")) as HTMLAnchorElement | null;

// Rect of the first visible line of text, so the cursor sits on the first line of a long row.
function firstLineRect(el: Element) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    range.selectNodeContents(node);
    const rect = [...range.getClientRects()].find((r) => r.width && r.height);
    if (rect) return rect;
  }
  return (el.querySelector("svg, img") ?? el).getBoundingClientRect();
}

export function startKeyNav() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};

  const root = document.documentElement;
  const make = (className: string, html = "") => {
    const el = document.createElement("div");
    el.className = className;
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = html;
    document.body.append(el);
    return el;
  };
  const cursor = make("kcursor", "&gt;");
  const row = make("krow");
  const bar = make("kbar", '<span class="kpath"></span><span class="kkeys"></span>');
  const pathEl = bar.querySelector(".kpath")!;
  const keysEl = bar.querySelector(".kkeys")!;
  root.classList.add("kready");

  let sel: HTMLElement | null = null;
  let query: string | null = null;
  let findFrom = -1;
  let wasNavigating = false;

  let page = location.pathname.replace(/\/$/, "");
  const home = () => document.querySelector<HTMLElement>("header.site .home");
  const items = () => [...document.querySelectorAll<HTMLElement>(SELECTOR)].filter((el) => el.offsetParent !== null);

  const idle = () => {
    pathEl.textContent = "~" + page;
    keysEl.textContent = "↑↓ navigate  / find";
  };
  idle();

  function status(list: HTMLElement[]) {
    const main = sel?.closest("main");
    const headings = [...document.querySelectorAll("main h2")].filter((h) => main && topOf(h) <= topOf(sel!) + 1);
    const section = headings.length ? nameOf(headings[headings.length - 1]).replace(/[^a-z0-9]+/g, "-") : "";
    return `~${page}${section && !page.endsWith(section) ? "/" + section : ""} [${list.indexOf(sel!) + 1}/${list.length}]`;
  }

  function hints() {
    const action = sel!.matches("button") ? sel!.title || sel!.getAttribute("aria-label") : linkOf(sel!) && "open";
    return `↑↓ move  ←→ row  ${action ? `⏎ ${action}  ` : ""}/ find  esc exit`;
  }

  function place() {
    if (!sel) return;
    const list = items();
    const main = document.querySelector("main")!.getBoundingClientRect();
    const peers = list.filter((el) => sameRow(el, sel!));
    const rects = peers.map((el) => el.getBoundingClientRect());
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    const pad = parseFloat(getComputedStyle(sel).paddingTop) >= 6 ? 0 : 6;
    const line = firstLineRect(sel);
    const target = sel.innerText.trim() ? sel : (sel.querySelector("svg, img") ?? sel);
    const left =
      sel === home()
        ? sel.getBoundingClientRect().left
        : peers.length > 1
          ? target.getBoundingClientRect().left - 13
          : main.left - 19;

    cursor.style.transform = `translate(${left + scrollX}px, ${(line.top + line.bottom) / 2 + scrollY}px)`;
    row.style.transform = `translate(${main.left - 30 + scrollX}px, ${top - pad + scrollY}px)`;
    row.style.width = `${main.width + 44}px`;
    row.style.height = `${bottom - top + pad * 2}px`;
    if (query === null) {
      pathEl.textContent = status(list);
      keysEl.textContent = hints();
    }
  }

  const observer = new ResizeObserver(() => place());

  function select(el: HTMLElement) {
    observer.disconnect();
    observer.observe(el);
    const first = !sel;
    sel?.classList.remove("ksel");
    sel = el;
    el.classList.add("ksel");
    root.classList.add("keynav");

    const rect = el.getBoundingClientRect();
    const margin = innerHeight * 0.22;
    if (rect.top < margin || rect.bottom > innerHeight - margin - 40) scrollBy({ top: rect.top - innerHeight * 0.4 });

    if (first) root.classList.add("kjump");
    place();
    if (first) {
      void cursor.offsetWidth;
      root.classList.remove("kjump");
    }
    // Restart the blink so the cursor is solid right after a move.
    cursor.style.animation = "none";
    void cursor.offsetWidth;
    cursor.style.animation = "";
  }

  function exit() {
    sel?.classList.remove("ksel");
    sel = null;
    query = null;
    root.classList.remove("keynav");
    idle();
  }

  function move(dir: Move, wrap = true) {
    const list = items();
    if (!list.length) return;
    if (dir === "first") return select(list[0]);
    if (dir === "last") return select(list[list.length - 1]);

    // Entering: start at the header when it's on screen, otherwise at the row nearest the middle.
    if (!sel || !list.includes(sel)) {
      const h = home()!.getBoundingClientRect();
      const mid = innerHeight * 0.4;
      if (h.bottom > 0 && h.top < innerHeight) return select(home()!);
      return select(list.reduce((a, b) => (Math.abs(topOf(b) - mid) < Math.abs(topOf(a) - mid) ? b : a)));
    }

    const current = sel.getBoundingClientRect();
    if (dir === "left" || dir === "right") {
      const peers = list.filter((el) => sameRow(el, sel!));
      const next = peers.indexOf(sel) + (dir === "right" ? 1 : -1);
      if (peers.length > 1 && (wrap || (next >= 0 && next < peers.length)))
        select(peers[(next + peers.length) % peers.length]);
      return;
    }

    const down = dir === "down";
    let candidates = list.filter((el) => (down ? topOf(el) > current.top + 4 : topOf(el) < current.top - 4));
    if (!candidates.length) {
      if (!wrap) return;
      candidates = list;
    }
    const edge = (down ? Math.min : Math.max)(...candidates.map(topOf));
    const nextRow = candidates.filter((el) => Math.abs(topOf(el) - edge) < 8);
    const inRow = list.filter((el) => sameRow(el, sel!)).length > 1;
    const leftOf = (el: Element) => el.getBoundingClientRect().left;
    nextRow.sort((a, b) =>
      inRow ? Math.abs(leftOf(a) - current.left) - Math.abs(leftOf(b) - current.left) : leftOf(a) - leftOf(b),
    );
    select(nextRow[0]);
  }

  function find(text: string) {
    pathEl.textContent = `/${text}█`;
    if (!text) return;
    const list = items();
    const needle = text.toLowerCase();
    const ordered = [...list.slice(findFrom + 1), ...list.slice(0, findFrom + 1)];
    const score = (el: HTMLElement) => {
      const body = el.innerText.toLowerCase();
      if (nameOf(el).startsWith(needle)) return 0;
      if (body.split(/[^a-z0-9]+/).some((word) => word.startsWith(needle))) return 1;
      return body.includes(needle) ? 2 : 3;
    };
    let best: HTMLElement | undefined;
    let bestScore = 3;
    for (const el of ordered) {
      const s = score(el);
      if (s < bestScore) {
        best = el;
        bestScore = s;
      }
      if (!s) break;
    }
    if (best) {
      select(best);
      pathEl.textContent = `/${text}█`;
    }
  }

  // Remember the opened link so the selection comes back on the next page (or after Back).
  function remember(link: HTMLAnchorElement) {
    if (link.origin !== location.origin) return;
    try {
      sessionStorage.setItem("keynav", link.href);
    } catch {}
  }

  function restore() {
    let href: string | null = null;
    try {
      href = sessionStorage.getItem("keynav");
      sessionStorage.removeItem("keynav");
    } catch {}
    if (!href) return;
    const list = items();
    const anchor = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    select(
      list.find((el) => linkOf(el)?.href === href) ?? list.find((el) => anchor && el.contains(anchor)) ?? home()!,
    );
    document.fonts.ready.then(place);
  }

  function shake() {
    root.classList.remove("kshake");
    void row.offsetWidth;
    root.classList.add("kshake");
  }
  const onShakeEnd = () => root.classList.remove("kshake");
  row.addEventListener("animationend", onShakeEnd);

  // Enter types "$ open <name>" into the bar, then follows the link.
  function open() {
    if (!sel) return;
    if (sel.matches("button")) {
      sel.click();
      return place();
    }
    const link = linkOf(sel);
    if (!link) return shake();
    remember(link);
    const command = `$ open ${nameOf(link) || link.hostname}`;
    let typed = 0;
    const timer = setInterval(() => {
      pathEl.textContent = command.slice(0, ++typed) + "█";
      if (typed >= command.length) {
        clearInterval(timer);
        setTimeout(() => link.click(), 120);
      }
    }, 150 / command.length);
  }

  function onKey(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
    // An open dialog (e.g. the photo gallery) owns the keyboard.
    if (document.querySelector("dialog[open]")) return;

    if (query !== null) {
      e.preventDefault();
      if (e.key === "Escape" || e.key === "Enter") {
        query = null;
        place();
      } else if (e.key === "Backspace") find((query = query.slice(0, -1)));
      else if (e.key.length === 1) find((query += e.key));
      return;
    }

    const dir = KEYS[e.key];
    if (dir) {
      e.preventDefault();
      move(dir, !e.repeat);
    } else if (e.key === "Enter" && sel) {
      e.preventDefault();
      open();
    } else if (e.key === "Escape" && sel) exit();
    else if (e.key === "/") {
      e.preventDefault();
      if (!sel) move("down");
      findFrom = items().indexOf(sel!);
      query = "";
      keysEl.textContent = "type to find  ⏎ keep  esc cancel";
      pathEl.textContent = "/█";
    }
  }

  const onMouseDown = () => {
    wasNavigating = !!sel;
    exit();
  };
  const onClick = (e: MouseEvent) => {
    const link = (e.target as Element).closest?.("a");
    if (!wasNavigating || !link || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    if (items().some((el) => linkOf(el) === link)) remember(link);
  };

  // Client-side page change: start over on the new page (and bring back a remembered selection).
  const onPageShift = () => {
    observer.disconnect();
    sel?.classList.remove("ksel");
    sel = null;
    query = null;
    root.classList.remove("keynav");
    page = location.pathname.replace(/\/$/, "");
    idle();
    restore();
  };

  addEventListener("pageshift", onPageShift);
  addEventListener("keydown", onKey);
  addEventListener("mousedown", onMouseDown);
  addEventListener("click", onClick);
  addEventListener("resize", place);
  addEventListener("scroll", place, { passive: true });
  restore();

  return () => {
    removeEventListener("pageshift", onPageShift);
    removeEventListener("keydown", onKey);
    removeEventListener("mousedown", onMouseDown);
    removeEventListener("click", onClick);
    removeEventListener("resize", place);
    removeEventListener("scroll", place);
    observer.disconnect();
    sel?.classList.remove("ksel");
    root.classList.remove("kready", "keynav", "kshake", "kjump");
    cursor.remove();
    row.remove();
    bar.remove();
  };
}
