"use client";

import { useState } from "react";

/**
 * Case-study figure. Handles image or video, caption, and a graceful
 * placeholder if the asset isn't in public/ yet.
 */
export default function Figure({
  src,
  caption,
  label,
  video = false,
  poster,
  ratio = "16/9",
  contain = false,
  top = false,
  accent = "var(--color-basis)",
}: {
  src: string;
  caption?: string;
  label?: string;
  video?: boolean;
  /** first frame, so a dark video does not flash a light panel while it loads */
  poster?: string;
  ratio?: string;
  contain?: boolean;
  /** anchor to the top edge, so a tall screenshot loses its bottom, never its sides */
  top?: boolean;
  accent?: string;
}) {
  const fit = contain
    ? "object-contain"
    : `object-cover ${top ? "object-top" : ""}`;
  const [missing, setMissing] = useState(false);

  return (
    <figure className="group w-full">
      <div
        className="relative w-full overflow-hidden rounded-[--radius-card] border border-grey-20 bg-gradient-to-br from-[#eaeee9] to-[#f6f6f4]"
        style={{ aspectRatio: ratio }}
      >
        {missing ? (
          <div className="grid size-full place-items-center">
            <span className="label text-grey-40">
              {label ?? "asset pending"}
            </span>
          </div>
        ) : video ? (
          <video
            src={src}
            poster={poster}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            onError={() => setMissing(true)}
            className={`size-full ${fit}`}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={caption ?? ""}
            onError={() => setMissing(true)}
            className={`size-full ${fit}`}
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-caption text-grey-40 transition-colors duration-300 group-hover:text-grey-90">
          {label && (
            <span className="label mr-2" style={{ color: accent }}>
              {label}
            </span>
          )}
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
