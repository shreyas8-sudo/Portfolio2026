"use client";

import { useState } from "react";

/**
 * Airliner. Uses /public/plane.svg when present, falls back to the inline mark.
 * Kept small and supporting, never the main attraction.
 */
export default function Plane({
  width = 90,
  climb = -18,
  tone = "grey",
  className = "",
}: {
  width?: number;
  climb?: number;
  tone?: "grey" | "navy" | "peri" | "white";
  className?: string;
}) {
  const [missing, setMissing] = useState(false);
  const fills = {
    grey: "#a8a8a3",
    navy: "#1e2d50",
    peri: "#b3c3e5",
    white: "#ffffff",
  } as const;

  if (!missing) {
    // the exported SVG already carries its own angle, don't double-rotate it
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/plane.svg"
        alt=""
        aria-hidden="true"
        onError={() => setMissing(true)}
        className={className}
        style={{ width, height: "auto", display: "block" }}
      />
    );
  }

  return (
    <svg
      width={width}
      height={width * (90 / 200)}
      viewBox="0 0 200 90"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g transform={`rotate(${climb} 100 42)`} fill={fills[tone]}>
        <path d="M190 42c0-5.5-9-9-21-9.5L60 30.5c-16-.5-30 1-40 3.5v16c10 2.5 24 4 40 3.5l109-2c12-.5 21-4 21-9.5Z" />
        <path d="M34 32.8 21 5h12l20 26.5z" />
        <path d="M27 37 3 28h12l24 8z" />
        <path d="M98 52.6 60 80h19l41-26z" />
        <path d="M84 54h20c3 .1 4 1.6 4 4 0 2.5-1.5 4-4 4l-20-.5c-3-.1-4-1.5-4-3.5 0-2.2 1.5-4 4-4Z" />
      </g>
    </svg>
  );
}
