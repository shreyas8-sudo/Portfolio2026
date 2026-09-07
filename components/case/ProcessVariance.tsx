/**
 * The problem, actually visualised: one process, three shapes.
 *
 * Same process name, three jurisdictions, three different step sequences.
 * Steps that appear in every lane are grey. Steps that only exist in one lane
 * are called out, because those are the variations nobody has written down.
 *
 * The shared/unique split is computed, not hand-tagged, so the diagram cannot
 * drift out of sync with the data.
 */

export type Lane = { region: string; rule: string; steps: string[] };

export default function ProcessVariance({
  process,
  lanes,
  more,
  accent,
  caption,
}: {
  process: string;
  lanes: Lane[];
  more: string;
  accent: string;
  caption?: string;
}) {
  const shared = new Set(
    lanes[0].steps.filter((s) => lanes.every((l) => l.steps.includes(s)))
  );

  return (
    <figure className="w-full">
      <div className="rounded-[--radius-panel] border border-grey-20 bg-grey-00 p-5 md:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-caption font-semibold text-grey-90">
            {process}
          </p>
          {/* the whole point of the diagram, said inside it */}
          <p className="text-caption font-medium text-grey-90">
            <mark
              className="rounded-[2px] px-1.5 py-0.5 text-grey-90"
              style={{ background: "rgba(47,74,124,0.14)" }}
            >
              One process, {lanes.length} shapes
            </mark>
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {lanes.map((l) => (
            <div key={l.region}>
              <div className="flex items-baseline gap-2.5">
                <span className="text-caption font-medium text-grey-90">
                  {l.region}
                </span>
                <span className="dot-code text-[11.5px]" style={{ color: accent }}>
                  {l.rule}
                </span>
              </div>

              <ol className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-2">
                {l.steps.map((step, i) => {
                  const only = !shared.has(step);
                  return (
                    <li key={step} className="flex items-center gap-1.5">
                      <span
                        className="whitespace-nowrap rounded-[--radius-sharp] border px-2.5 py-1.5 text-[12.5px]"
                        style={
                          only
                            ? {
                                borderColor: "rgba(47,74,124,0.4)",
                                background: "rgba(47,74,124,0.07)",
                                color: "var(--color-grey-90)",
                                fontWeight: 500,
                              }
                            : {
                                borderColor: "var(--color-grey-20)",
                                color: "var(--color-grey-60)",
                              }
                        }
                      >
                        {step}
                      </span>
                      {i < l.steps.length - 1 && (
                        <span className="text-grey-20" aria-hidden="true">
                          ·
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>

        {/* legend */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-grey-10 pt-4">
          <span className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-[1px] border"
              style={{
                borderColor: "rgba(47,74,124,0.4)",
                background: "rgba(47,74,124,0.15)",
              }}
            />
            <span className="text-caption text-grey-60">
              exists in only one jurisdiction
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-[1px] border border-grey-20" />
            <span className="text-caption text-grey-60">shared by all three</span>
          </span>
        </div>

        <p className="mt-4 text-caption text-grey-60">
          {more}{" "}
          <span className="font-medium text-grey-90">
            And every one of them keeps changing after you write it down.
          </span>
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
