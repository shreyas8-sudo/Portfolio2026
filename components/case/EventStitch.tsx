/**
 * The solution idea, drawn: Case ID plus time plus event, stitched.
 *
 * Left, the raw event logs each system already writes. The Case ID is the
 * constant across all of them, so it is the only thing highlighted. Right,
 * the same rows sorted by timestamp into one reconstructed path.
 *
 * Nobody was asked to remember anything.
 */

export type LogRow = { id: string; time: string; event: string; system: string };

function Row({
  r,
  accent,
  showSystem = false,
}: {
  r: LogRow;
  accent: string;
  showSystem?: boolean;
}) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 py-1">
      <span className="dot-code text-[11.5px]" style={{ color: accent }}>
        {r.id}
      </span>
      <span className="dot-code text-[11.5px] text-grey-40">{r.time}</span>
      <span className="text-[12.5px] text-grey-90">{r.event}</span>
      {showSystem && (
        <span className="label text-grey-40">{r.system}</span>
      )}
    </li>
  );
}

export default function EventStitch({
  systems,
  accent,
  caption,
}: {
  systems: { name: string; rows: LogRow[] }[];
  accent: string;
  caption?: string;
}) {
  const stitched = systems
    .flatMap((s) => s.rows)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <figure className="w-full">
      <div className="rounded-[--radius-panel] border border-grey-20 bg-grey-00 p-5 md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          {/* raw logs, as they already exist */}
          <div>
            <p className="label text-grey-40">What each system already writes</p>
            <div className="mt-3 space-y-3">
              {systems.map((s) => (
                <div
                  key={s.name}
                  className="rounded-[--radius-card] border border-grey-20 bg-grey-05 px-3.5 py-2.5"
                >
                  <p className="text-caption font-semibold text-grey-90">
                    {s.name}
                  </p>
                  <ul className="mt-1">
                    {s.rows.map((r) => (
                      <Row key={r.time + r.event} r={r} accent={accent} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* the stitch */}
          <div className="flex items-center justify-center gap-3 lg:flex-col">
            <span
              className="label whitespace-nowrap lg:[writing-mode:vertical-rl]"
              style={{ color: accent }}
            >
              sort by time
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

          {/* one reconstructed path */}
          <div>
            <p className="label" style={{ color: accent }}>
              One reconstructed path
            </p>
            <div
              className="mt-3 rounded-[--radius-card] border px-3.5 py-2.5"
              style={{
                borderColor: "rgba(47,74,124,0.35)",
                background: "rgba(47,74,124,0.04)",
              }}
            >
              <ul>
                {stitched.map((r) => (
                  <Row
                    key={r.time + r.event}
                    r={r}
                    accent={accent}
                    showSystem
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-5 border-t border-grey-10 pt-4 text-caption text-grey-60">
          The Case ID is the constant. Time and event do the rest. Nobody was
          asked to remember anything.
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
