"use client";

/**
 * One fraud case crossing five systems, with the Case ID mutating at each hop
 * until the thread breaks. Drawn rather than screenshotted so it stays sharp
 * and uses the site's own type and colour.
 *
 * The point of the diagram is the bottom row: the same case, five different names.
 */

export type Hop = {
  system: string;
  id: string;
  /** how the id changed here */
  fate: "clean" | "reformatted" | "renamed" | "lost";
};

const FATE: Record<Hop["fate"], { word: string; ink: string; line: string; fill: string }> = {
  clean: {
    word: "logged",
    ink: "#4a6b52",
    line: "rgba(74,107,82,0.32)",
    fill: "rgba(74,107,82,0.05)",
  },
  reformatted: {
    word: "reformatted",
    ink: "#9a761c",
    line: "rgba(199,155,45,0.5)",
    fill: "rgba(224,179,60,0.11)",
  },
  renamed: {
    word: "renamed",
    ink: "#9a761c",
    line: "rgba(199,155,45,0.5)",
    fill: "rgba(224,179,60,0.11)",
  },
  lost: {
    word: "thread lost",
    ink: "#a8443a",
    line: "rgba(192,91,82,0.45)",
    fill: "rgba(192,91,82,0.10)",
  },
};

export default function CaseHops({
  hops,
  caption,
  accent,
}: {
  hops: Hop[];
  caption?: string;
  accent: string;
}) {
  return (
    <figure className="w-full">
      <div className="rounded-[--radius-panel] border border-grey-20 bg-grey-00 p-5 md:p-7">
        <p className="label" style={{ color: accent }}>
          One case, five systems
        </p>

        <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {hops.map((h, i) => {
            const f = FATE[h.fate];
            return (
              <li key={h.system} className="relative">
                {/* the connector, only where the row is actually continuous */}
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -left-3 top-9 hidden w-3 lg:block"
                  >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path
                        d="M0 4h8M7 1l3 3-3 3"
                        stroke="var(--color-grey-40)"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={h.fate === "lost" ? "2 2" : undefined}
                      />
                    </svg>
                  </span>
                )}

                <div
                  className="flex h-full flex-col rounded-[--radius-card] border p-3.5"
                  style={{ borderColor: f.line, background: f.fill }}
                >
                  <p className="text-caption font-semibold leading-snug text-grey-90">
                    {h.system}
                  </p>

                  <p
                    className="dot-code mt-3 break-all text-[12px]"
                    style={{
                      color: f.ink,
                      textDecoration: h.fate === "lost" ? "line-through" : undefined,
                    }}
                  >
                    {h.id}
                  </p>

                  <p className="label mt-2" style={{ color: f.ink }}>
                    {f.word}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-5 border-t border-grey-10 pt-4 text-caption text-grey-60">
          Same case. Five names. By audit time it is fragments, stitched back
          together by hand.
        </p>
      </div>

      {caption && (
        <figcaption className="mt-2.5 text-caption text-grey-40">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
