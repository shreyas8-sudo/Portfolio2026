"use client";

import { useEffect, useState } from "react";
import DotMatrix from "./DotMatrix";

const ZONES = [
  { code: "HYD", tz: "Asia/Kolkata", color: "var(--color-sky)" },
  { code: "LAX", tz: "America/Los_Angeles", color: "var(--color-orange)" },
];

function timeIn(tz: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(new Date());
}

/**
 * Live local times as a departure board.
 * Airport code lights up in its own colour, the time stays dark like a real board.
 * Renders "--:--" until mounted so the server and client markup agree.
 */
export default function Clocks({
  tone = "light",
  dot = 2,
  gap = 1,
}: {
  tone?: "light" | "dark";
  dot?: number;
  gap?: number;
}) {
  const [times, setTimes] = useState<string[] | null>(null);

  useEffect(() => {
    const tick = () => setTimes(ZONES.map((z) => timeIn(z.tz)));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const dark = tone === "dark";
  const timeColor = dark ? "rgba(255,255,255,0.88)" : "var(--color-grey-90)";
  const off = dark ? "rgba(255,255,255,0.09)" : "var(--color-grey-10)";

  return (
    <div className="flex items-center" style={{ gap: `${dot * 8}px` }}>
      {ZONES.map((z, i) => (
        <span
          key={z.code}
          className="inline-flex items-center"
          style={{ gap: `${dot * 2.5}px` }}
        >
          <DotMatrix text={z.code} color={z.color} off={off} dot={dot} gap={gap} />
          <DotMatrix
            text={times ? times[i] : "--:--"}
            color={timeColor}
            off={off}
            dot={dot}
            gap={gap}
          />
        </span>
      ))}
    </div>
  );
}
