import { MapPin } from "lucide-react";
import type { ReactNode } from "react";

// Components usable inside experience MDX. Hover (or tap/focus on mobile) previews are
// pure CSS, so they work in server components without client JS.

// <Timeline> wraps <Moment>s. Every row is a two-column grid (node | body);
// the node column draws its own piece of the line, so line and dots always line up.
export function Timeline({ children }: { children: ReactNode }) {
  return <ol className="tl">{children}</ol>;
}

// One moment: date, title, place, description and small thumbnails (100 x 60)
// that open the page gallery (PhotoViewer) on click.
export function Moment({
  date,
  place,
  title,
  photos,
  children,
}: {
  date: string;
  place?: string;
  title: string;
  // caption: the short text shown under the photo in the gallery.
  photos?: { src: string; alt: string; caption?: string }[];
  children: ReactNode;
}) {
  return (
    <li className="tl-row tl-moment">
      <span className="tl-node" aria-hidden />
      <div className="tl-body">
        <time className="tl-date">{date}</time>
        <h3 className="tl-title">{title}</h3>
        {place && (
          <p className="tl-place">
            <MapPin size={13} strokeWidth={1.75} aria-hidden />
            {place}
          </p>
        )}
        <div className="tl-text">{children}</div>
        {photos && photos.length > 0 && (
          <div className="tl-gallery">
            {photos.map((photo) => (
              // Opens in PhotoViewer (page-wide gallery), where the caption shows; a plain link without JS.
              <a
                key={photo.src}
                href={photo.src}
                className="tl-thumb"
                data-viewer
                data-alt={photo.alt}
                data-caption={photo.caption ?? ""}
                aria-label={photo.alt}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- photos come from MDX */}
                <img src={photo.src} alt="" loading="lazy" />
              </a>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

// A person mentioned in the text: highlighted name, and a small card on hover.
export function Person({
  name,
  role,
  photo,
  note,
  children,
}: {
  name: string;
  role?: string;
  photo?: string;
  note?: string;
  children?: ReactNode;
}) {
  return (
    <span className="person" tabIndex={0}>
      {children ?? name}
      <span className="person-card" role="tooltip">
        {/* eslint-disable-next-line @next/next/no-img-element -- photos come from MDX */}
        {photo && <img src={photo} alt="" loading="lazy" />}
        <span>
          <strong>{name}</strong>
          {role && <span className="person-role">{role}</span>}
          {note && <span className="person-note">{note}</span>}
        </span>
      </span>
    </span>
  );
}

export const mdxComponents = { Timeline, Moment, Person };
