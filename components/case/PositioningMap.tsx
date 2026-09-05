"use client";

import { useState } from "react";

/**
 * Two-axis competitive map. Drawn as SVG so it stays readable at any size and
 * can be corrected by editing one array, rather than re-exporting an image.
 *
 * x: 0 needs clean data → 1 handles fragments
 * y: 0 automates known processes → 1 discovers unknown ones
 */

export type Player = {
  name: string;
  x: number;
  y: number;
  note?: string;
  /** the one we built */
  ours?: boolean;
};

const W = 640;
const H = 420;
const PAD = 54;

export default function PositioningMap({
  players,
  xLow,
  xHigh,
  yLow,
  yHigh,
  accent,
  caption,
  highlight = "tr",
}: {
  players: Player[];
  xLow: string;
  xHigh: string;
  yLow: string;
  yHigh: string;
  accent: string;
  caption?: string;
  /** which quadrant is the open space */
  highlight?: "tl" | "tr" | "bl" | "br";
}) {
  const [hover, setHover] = useState<string | null>(null);

  const px = (x: number) => PAD + x * (W - PAD * 2);
  const py = (y: number) => H - PAD - y * (H - PAD * 2);

  return (
    <figure className="w-full">
      <div className="overflow-hidden rounded-[--radius-panel] border border-grey-20 bg-grey-00 p-3 md:p-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
          {/* quadrant tint behind the space we own */}
          <rect
            x={highlight.endsWith("l") ? PAD : W / 2}
            y={highlight.startsWith("t") ? PAD : H / 2}
            width={W / 2 - PAD}
            height={H / 2 - PAD}
            fill={accent}
            opacity="0.05"
          />

          {/* axes */}
          <line
            x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2}
            stroke="var(--color-grey-20)" strokeWidth="1"
          />
          <line
            x1={W / 2} y1={PAD} x2={W / 2} y2={H - PAD}
            stroke="var(--color-grey-20)" strokeWidth="1"
          />

          {/* axis labels */}
          <text x={PAD} y={H / 2 + 18} className="fill-grey-40" fontSize="11" fontWeight="500">
            {xLow}
          </text>
          <text x={W - PAD} y={H / 2 + 18} textAnchor="end" className="fill-grey-40" fontSize="11" fontWeight="500">
            {xHigh}
          </text>
          <text x={W / 2 + 8} y={PAD - 6} className="fill-grey-40" fontSize="11" fontWeight="500">
            {yHigh}
          </text>
          <text x={W / 2 + 8} y={H - PAD + 16} className="fill-grey-40" fontSize="11" fontWeight="500">
            {yLow}
          </text>

          {/* players */}
          {players.map((p) => {
            const on = hover === p.name;
            const cx = px(p.x);
            const cy = py(p.y);
            return (
              <g
                key={p.name}
                onMouseEnter={() => setHover(p.name)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "default" }}
              >
                {p.ours && (
                  <circle
                    cx={cx} cy={cy} r={on ? 20 : 16}
                    fill="none" stroke={accent} strokeWidth="1"
                    opacity="0.45"
                    style={{ transition: "r 200ms" }}
                  />
                )}
                <circle
                  cx={cx} cy={cy} r={p.ours ? 7 : 5.5}
                  fill={p.ours ? accent : "var(--color-grey-40)"}
                  opacity={p.ours || on ? 1 : 0.72}
                />
                <text
                  x={cx} y={cy - (p.ours ? 15 : 12)}
                  textAnchor="middle"
                  fontSize={p.ours ? 13 : 12}
                  fontWeight={p.ours ? 600 : 500}
                  fill={p.ours ? accent : "var(--color-grey-60)"}
                >
                  {p.name}
                </text>
                {p.note && on && (
                  <text
                    x={cx} y={cy + 22}
                    textAnchor="middle"
                    fontSize="11"
                    className="fill-grey-60"
                  >
                    {p.note}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {caption && (
        <figcaption className="mt-2.5 text-caption text-grey-40">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
