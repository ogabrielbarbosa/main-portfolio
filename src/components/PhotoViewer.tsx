"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Photo {
  src: string;
  alt: string;
  caption: string;
}

// In `next dev` the caption is editable: click it, type, Enter (or click away) saves it
// into the MDX through /api/dev/caption.
const EDITABLE = process.env.NODE_ENV !== "production";

// One gallery for every timeline photo on the page (.tl-thumb links from mdx.tsx):
// click a thumbnail to open it, then ← / → (or the arrows, or a swipe) move through
// all photos in page order; Esc, × or a click outside closes. Without JS the
// thumbnails are plain links to the image.
export function PhotoViewer({
  labels,
}: {
  labels: { prev: string; next: string; close: string };
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const [status, setStatus] = useState<"" | "saving" | "saved" | "error">("");

  async function saveCaption(value: string) {
    const current = photos[index];
    if (!current || value.trim() === current.caption) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/dev/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: location.pathname,
          src: current.src,
          caption: value,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { caption } = (await res.json()) as { caption: string };
      setPhotos((list) =>
        list.map((p) => (p.src === current.src ? { ...p, caption } : p)),
      );
      document
        .querySelectorAll<HTMLAnchorElement>("a.tl-thumb")
        .forEach((t) => {
          if (t.getAttribute("href") === current.src)
            t.dataset.caption = caption;
        });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  const go = useCallback(
    (step: number) =>
      setIndex((i) =>
        photos.length ? (i + step + photos.length) % photos.length : 0,
      ),
    [photos.length],
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const thumb = (event.target as Element).closest<HTMLAnchorElement>(
        "a.tl-thumb",
      );
      if (!thumb || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      const thumbs = [
        ...document.querySelectorAll<HTMLAnchorElement>("a.tl-thumb"),
      ];
      setPhotos(
        thumbs.map((t) => ({
          src: t.getAttribute("href") ?? "",
          alt: t.dataset.alt ?? "",
          caption: t.dataset.caption ?? "",
        })),
      );
      setIndex(thumbs.indexOf(thumb));
      dialog.current?.showModal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!dialog.current?.open) return;
      if ((event.target as Element).closest?.("textarea")) return;
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go]);

  const photo = photos[index];
  const neighbours =
    photos.length > 1
      ? [
          photos[(index + 1) % photos.length],
          photos[(index - 1 + photos.length) % photos.length],
        ]
      : [];

  return (
    <dialog
      ref={dialog}
      className="viewer"
      aria-label={photo?.alt}
      // A click on the backdrop (the dialog itself, outside the frame) closes it.
      onClick={(event) =>
        event.target === event.currentTarget && dialog.current?.close()
      }
      onTouchStart={(event) => (touchX.current = event.touches[0].clientX)}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const dx = event.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {photo && (
        <figure className="viewer-frame">
          {/* eslint-disable-next-line @next/next/no-img-element -- photos come from MDX */}
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            onLoad={() => setStatus("")}
          />
          {EDITABLE ? (
            <figcaption className="editable">
              <textarea
                key={photo.src}
                className="viewer-caption"
                defaultValue={photo.caption}
                placeholder="Escreva uma descrição… (Enter salva)"
                rows={2}
                onFocus={() => setStatus("")}
                onBlur={(event) => saveCaption(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }}
              />
              {status && (
                <span className="viewer-status">
                  {
                    {
                      saving: "salvando…",
                      saved: "salvo ✓",
                      error: "não salvou",
                    }[status]
                  }
                </span>
              )}
            </figcaption>
          ) : (
            photo.caption && (
              <figcaption>
                <span className="viewer-caption">{photo.caption}</span>
              </figcaption>
            )
          )}
        </figure>
      )}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="viewer-nav prev"
            onClick={() => go(-1)}
            aria-label={labels.prev}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="viewer-nav next"
            onClick={() => go(1)}
            aria-label={labels.next}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}
      <button
        type="button"
        className="viewer-close"
        onClick={() => dialog.current?.close()}
        aria-label={labels.close}
      >
        <X size={20} />
      </button>
      {/* Preload the next and previous photos so arrows feel instant. */}
      <div hidden>
        {neighbours.map((n) => (
          // eslint-disable-next-line @next/next/no-img-element -- preload only
          <img key={n.src} src={n.src} alt="" />
        ))}
      </div>
    </dialog>
  );
}
