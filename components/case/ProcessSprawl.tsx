/**
 * The actual problem: one process, and every version of it.
 *
 * Not a Case ID diagram. The Case ID is the one thing that stays constant,
 * which is what the solution leans on. What mutates is the process itself,
 * and the only thing documenting it today is someone's memory.
 */

export type Variant = { region: string; rule: string };

export default function ProcessSprawl({
  process,
  variants,
  more,
  accent,
  caption,
}: {
  process: string;
  variants: Variant[];
  /** how many more sit in the long tail */
  more: string;
  accent: string;
  caption?: string;
}) {
  return (
    <figure className="w-full">
      <div className="rounded-[--radius-panel] border border-grey-20 bg-grey-00 p-5 md:p-7">
        {/* the one process */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="label text-grey-40">One process</span>
          <span
            className="rounded-[--radius-tag] border px-3 py-1.5 text-caption font-medium text-grey-90"
            style={{ borderColor: "rgba(47,74,124,0.35)", background: "rgba(47,74,124,0.05)" }}
          >
            {process}
          </span>
        </div>

        {/* it forks */}
        <div className="mt-5 flex gap-4">
          <span
            aria-hidden="true"
            className="ml-4 w-px shrink-0"
            style={{ background: "var(--color-grey-20)" }}
          />
          <ul className="flex-1 space-y-2">
            {variants.map((v) => (
              <li key={v.region} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  aria-hidden="true"
                  className="h-px w-4 shrink-0"
                  style={{ background: "var(--color-grey-20)" }}
                />
                <span className="text-caption font-medium text-grey-90">
                  {v.region}
                </span>
                <span className="dot-code text-[12px]" style={{ color: accent }}>
                  {v.rule}
                </span>
              </li>
            ))}
            <li className="flex items-baseline gap-x-3">
              <span
                aria-hidden="true"
                className="h-px w-4 shrink-0"
                style={{ background: "var(--color-grey-20)" }}
              />
              <span className="text-caption text-grey-40">{more}</span>
            </li>
          </ul>
        </div>

        {/* and every one of them changes */}
        <div className="mt-6 grid gap-3 border-t border-grey-10 pt-5 sm:grid-cols-2">
          <p className="text-caption text-grey-60">
            <span className="label mb-1 block text-grey-40">Each one mutates</span>
            by country, by regulation, by team, and keeps mutating after you write
            it down.
          </p>
          <p className="text-caption text-grey-60">
            <span className="label mb-1 block text-grey-40">Documented today by</span>
            <span className="font-medium text-grey-90">
              asking thousands of people what they remember.
            </span>
          </p>
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
