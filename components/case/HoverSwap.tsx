"use client";

import { useState } from "react";

/**
 * Two screenshots of the same thing, the second revealed on hover.
 *
 * Both images are stacked and always in the DOM, so the swap is a cross-fade
 * with no flash of loading on first hover.
 */
export default function HoverSwap({
  a,
  b,
  alt,
  hint,
  label,
  caption,
  ratio = "16/9",
  accent,
}: {
  a: string;
  b: string;
  alt: string;
  /** small nudge telling people there is a second state */
  hint?: string;
  label?: string;
  caption?: string;
  ratio?: string;
  accent: string;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <figure className="group w-full">
      <div
        className="relative w-full overflow-hidden rounded-[--radius-card] border border-grey-20 bg-gradient-to-br from-[#eaeee9] to-[#f6f6f4]"
        style={{ aspectRatio: ratio }}
      >
        {missing ? (
          <div className="grid size-full place-items-center">
            <span className="label text-grey-40">{label ?? "asset pending"}</span>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a}
              alt={alt}
              onError={() => setMissing(true)}
              className="absolute inset-0 size-full object-cover object-top transition-opacity duration-300 group-hover:opacity-0"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover object-top opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </>
        )}

        {hint && !missing && (
          <span
            className="pointer-events-none absolute right-3 top-3 rounded-[--radius-pill] px-2.5 py-1 text-[11px] font-medium text-white transition-opacity duration-300 group-hover:opacity-0"
            style={{ background: accent }}
          >
            {hint}
          </span>
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
