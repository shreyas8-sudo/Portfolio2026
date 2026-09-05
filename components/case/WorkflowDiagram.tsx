"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The cost segregation workflow, drawn rather than screenshotted, so it uses
 * the site's own type, colour and radii instead of a flattened export.
 *
 * Two views: the whole study, and the single step that became the product.
 * Severity is carried by colour, and every painful step names its pain, so
 * the diagram argues rather than just diagrams.
 */

export type Severity = "smooth" | "friction" | "pain";

export type Step = {
  n: string;
  name: string;
  note?: string;
  severity: Severity;
  /** what goes wrong here, shown in the chip below the card */
  pain?: string;
};

export type View = { id: string; label: string; heading?: string; steps: Step[] };

/* tuned against the site palette, not lifted from a stock chart library */
const TONE: Record<Severity, { fill: string; line: string; ink: string; word: string }> = {
  smooth: {
    fill: "rgba(53,101,77,0.06)",
    line: "rgba(53,101,77,0.30)",
    ink: "#35654d",
    word: "smooth",
  },
  friction: {
    fill: "rgba(224,179,60,0.13)",
    line: "rgba(199,155,45,0.55)",
    ink: "#9a761c",
    word: "friction",
  },
  pain: {
    fill: "rgba(192,91,82,0.10)",
    line: "rgba(192,91,82,0.42)",
    ink: "#a8443a",
    word: "high pain, and where AI is risky",
  },
};

function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="mt-[3.2rem] hidden shrink-0 self-start text-grey-40 sm:block"
    >
      <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
        <path
          d="M0.5 5h13M10 1l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Card({ s }: { s: Step }) {
  const t = TONE[s.severity];

  return (
    <li className="flex w-[13.5rem] shrink-0 flex-col gap-2 sm:w-[12.5rem]">
      <div
        className="flex min-h-[9.5rem] flex-col rounded-[--radius-card] border p-3.5"
        style={{ background: t.fill, borderColor: t.line }}
      >
        <span className="dot-code text-[11px]" style={{ color: t.ink }}>
          {s.n}
        </span>
        <p className="mt-1.5 text-caption font-semibold leading-snug text-grey-90">
          {s.name}
        </p>
        {s.note && (
          <p className="mt-1.5 text-[12.5px] leading-snug text-grey-60">
            {s.note}
          </p>
        )}
      </div>

      {/* the pain chip, the reason this diagram exists */}
      {s.pain ? (
        <p
          className="flex items-start gap-1.5 rounded-[--radius-sharp] border px-2.5 py-2 text-[11.5px] leading-snug"
          style={{
            background: TONE.pain.fill,
            borderColor: TONE.pain.line,
            color: "var(--color-grey-60)",
          }}
        >
          <span aria-hidden="true" style={{ color: TONE.pain.ink }}>
            ⚠
          </span>
          {s.pain}
        </p>
      ) : (
        <span className="hidden sm:block sm:h-[2.6rem]" aria-hidden="true" />
      )}
    </li>
  );
}

export default function WorkflowDiagram({
  views,
  accent,
}: {
  views: View[];
  accent: string;
}) {
  const [active, setActive] = useState(views[0].id);
  const view = views.find((v) => v.id === active) ?? views[0];

  /* the track scrolls sideways, so it has to say so */
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ left: el.scrollLeft > 4, right: max > 4 && el.scrollLeft < max - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, active]);

  const nudge = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <figure className="w-full">
      {/* view toggle */}
      {views.length > 1 && (
        <div className="flex justify-center">
          <div className="inline-flex gap-1 rounded-[--radius-pill] bg-grey-05 p-1">
            {views.map((v) => {
              const on = v.id === active;
              return (
                <button
                  key={v.id}
                  onClick={() => setActive(v.id)}
                  aria-pressed={on}
                  className="rounded-[--radius-pill] px-4 py-2 text-caption font-medium transition-colors duration-200"
                  style={{
                    background: on ? accent : "transparent",
                    color: on ? "#fff" : "var(--color-grey-60)",
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view.heading && (
        <p
          className="mt-6 text-center text-sub font-semibold"
          style={{ color: accent }}
        >
          {view.heading}
        </p>
      )}

      {/* the track, scrolls sideways rather than shrinking to nothing */}
      <div className="relative mt-6">
        <div
          ref={track}
          onScroll={measure}
          className="-mx-6 overflow-x-auto px-6 pb-3 md:-mx-10 md:px-10"
        >
          <ol className="flex items-start gap-2">
            {view.steps.map((s, i) => (
              <li key={s.n} className="contents">
                <Card s={s} />
                {i < view.steps.length - 1 && <Arrow />}
              </li>
            ))}
          </ol>
        </div>

        {/* edge fades, so a cut-off card looks cut off on purpose */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-grey-00 to-transparent transition-opacity duration-200"
          style={{ opacity: edge.left ? 1 : 0 }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-grey-00 to-transparent transition-opacity duration-200"
          style={{ opacity: edge.right ? 1 : 0 }}
        />

        {/* and real controls, because a fade alone is easy to miss */}
        {(edge.left || edge.right) && (
          <div className="mt-1 flex items-center justify-between">
            <span className="label text-grey-40">
              {view.steps.length} steps, scroll to see them all
            </span>
            <span className="flex gap-1.5">
              {([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => nudge(d)}
                  disabled={d === -1 ? !edge.left : !edge.right}
                  aria-label={d === -1 ? "Scroll left" : "Scroll right"}
                  className="grid size-7 place-items-center rounded-[--radius-pill] border border-grey-20 text-grey-60 transition-colors duration-200 hover:border-grey-40 hover:text-grey-90 disabled:opacity-30"
                >
                  <svg width="12" height="10" viewBox="0 0 16 10" fill="none">
                    <path
                      d={d === 1 ? "M0.5 5h13M10 1l4 4-4 4" : "M15.5 5h-13M6 1L2 5l4 4"}
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </span>
          </div>
        )}
      </div>

      {/* legend */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
        {(Object.keys(TONE) as Severity[]).map((k) => (
          <span key={k} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-[--radius-pill]"
              style={{ background: TONE[k].ink }}
            />
            <span className="text-caption text-grey-60">{TONE[k].word}</span>
          </span>
        ))}
      </div>
    </figure>
  );
}
