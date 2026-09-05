/**
 * What the skill actually does: messy notes in, structured spec out.
 *
 * Mirrors the event-log diagram in Track 01 on purpose. Both tracks are the
 * same move, taking something unstructured that already exists and giving it
 * a shape a machine can work from.
 */

export type SpecPart = { name: string; what: string };

export default function SpecFramework({
  notes,
  parts,
  accent,
  caption,
}: {
  /** the messy input, as someone would actually type it */
  notes: string[];
  parts: SpecPart[];
  accent: string;
  caption?: string;
}) {
  return (
    <figure className="w-full">
      <div className="rounded-[--radius-panel] border border-grey-20 bg-grey-00 p-5 md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1.25fr] lg:items-center">
          {/* messy in */}
          <div>
            <p className="label text-grey-40">What someone actually writes</p>
            <div className="mt-3 rounded-[--radius-card] border border-grey-20 bg-grey-05 p-4">
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li key={n} className="text-[12.5px] leading-snug text-grey-60">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* the parse */}
          <div className="flex items-center justify-center gap-3 lg:flex-col">
            <span
              className="label whitespace-nowrap lg:[writing-mode:vertical-rl]"
              style={{ color: accent }}
            >
              parse, don&apos;t prompt
            </span>
            <svg
              width="34" height="14" viewBox="0 0 34 14" fill="none"
              className="lg:rotate-90"
              aria-hidden="true"
            >
              <path
                d="M0 7h28M25 2l6 5-6 5"
                stroke={accent}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* structured out */}
          <div>
            <p className="label" style={{ color: accent }}>
              What the agent can build from
            </p>
            <ol
              className="mt-3 divide-y rounded-[--radius-card] border"
              style={{
                borderColor: "rgba(47,74,124,0.3)",
                background: "rgba(47,74,124,0.04)",
              }}
            >
              {parts.map((p, i) => (
                <li
                  key={p.name}
                  className="flex gap-3 px-4 py-2.5"
                  style={{ borderColor: "rgba(47,74,124,0.14)" }}
                >
                  <span
                    className="dot-code shrink-0 text-[11px]"
                    style={{ color: accent }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="text-caption font-medium text-grey-90">
                      {p.name}
                    </span>
                    <span className="ml-2 text-[12.5px] text-grey-60">
                      {p.what}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {caption && (
        <figcaption className="mt-2.5 text-caption text-grey-40">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
