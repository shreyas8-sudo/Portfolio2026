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

/** Which run of steps the product actually takes on, bracketed under the track. */
export type Solves = { from: number; to: number; note: string };

export type View = {
  id: string;
  label: string;
  heading?: string;
  steps: Step[];
  solves?: Solves;
};

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

function Card({
  s,
  cardRef,
}: {
  s: Step;
  cardRef?: (el: HTMLLIElement | null) => void;
}) {
  const t = TONE[s.severity];

  return (
    <li
      ref={cardRef}
      /* narrower on a phone: three cards' worth of scroll to see nine steps
         is a lot of swiping, and the type holds up fine at this width */
      className="flex w-[10.5rem] shrink-0 flex-col gap-2 sm:w-[12.5rem] sm:gap-2.5"
    >
      <div
        className="flex min-h-[8.25rem] flex-col rounded-[--radius-panel] border-[1.5px] p-3 sm:min-h-[9.5rem] sm:p-4"
        style={{ background: t.fill, borderColor: t.line }}
      >
        <span className="dot-code text-[10px] sm:text-[11px]" style={{ color: t.ink }}>
          {s.n}
        </span>
        <p className="mt-1.5 text-[0.875rem] font-semibold leading-snug tracking-[-0.01em] text-grey-90 sm:text-[0.9375rem]">
          {s.name}
        </p>
        {s.note && (
          <p className="mt-1.5 text-[11.5px] leading-snug text-grey-60 sm:text-[13px]">
            {s.note}
          </p>
        )}
      </div>

      {/* the pain chip, the reason this diagram exists */}
      {s.pain ? (
        <p
          className="flex items-start gap-1.5 rounded-[--radius-card] border px-2.5 py-2 text-[11px] leading-snug sm:px-3 sm:py-2.5 sm:text-[12px]"
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
        <span className="hidden sm:block sm:h-[3rem]" aria-hidden="true" />
      )}
    </li>
  );
}

export default function WorkflowDiagram({
  views,
  accent,
  logo,
}: {
  views: View[];
  accent: string;
  /** the product's mark, dropped under the steps it takes on */
  logo?: string;
}) {
  const [active, setActive] = useState(views[0].id);
  const view = views.find((v) => v.id === active) ?? views[0];

  /* the track scrolls sideways, so it has to say so */
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: false });

  /* the bracket has to line up with real cards, so it is measured rather
     than guessed from a column count that changes with the breakpoint. */
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const [span, setSpan] = useState<{ left: number; width: number } | null>(null);

  const measureSpan = useCallback(() => {
    const s = view.solves;
    if (!s) return setSpan(null);
    const a = cards.current[s.from];
    const b = cards.current[s.to];
    if (!a || !b) return setSpan(null);
    setSpan({
      left: a.offsetLeft,
      width: b.offsetLeft + b.offsetWidth - a.offsetLeft,
    });
  }, [view]);

  useEffect(() => {
    measureSpan();
    const ro = new ResizeObserver(measureSpan);
    const el = track.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [measureSpan]);

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
                  className="rounded-[--radius-pill] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 sm:px-4 sm:py-2 sm:text-caption"
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
          <div className="relative w-max">
            <ol className="flex items-start gap-2">
              {view.steps.map((s, i) => (
                <li key={s.n} className="contents">
                  <Card
                    s={s}
                    cardRef={(el) => {
                      cards.current[i] = el;
                    }}
                  />
                  {i < view.steps.length - 1 && <Arrow />}
                </li>
              ))}
            </ol>

            {/* Where the product intervenes. A soft rule under the run of
                steps, the mark centred beneath it. Deliberately quiet: the
                cards are already loud, and a boxed callout here competed
                with the pain chips right above it. */}
            {view.solves && span && (
              <div className="relative mt-4 h-[4.75rem]">
                <div
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: span.left, width: span.width }}
                >
                  <span
                    className="h-[2px] w-full rounded-full"
                    style={{ background: "var(--color-basis-light)" }}
                    aria-hidden="true"
                  />
                  <span className="mt-3 flex items-center gap-2 sm:mt-3.5 sm:gap-2.5">
                    {logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt=""
                        className="size-7 shrink-0 object-contain sm:size-9"
                      />
                    )}
                    <span className="label" style={{ color: accent }}>
                      {view.solves.note}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* No edge fades. They were meant to say "this scrolls", but a white
            wash sitting on top of a card reads as a rendering fault, not as
            an affordance. The label and the arrows below say it in words. */}

        {/* real controls, because a cut-off card alone is easy to miss */}
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
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
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
