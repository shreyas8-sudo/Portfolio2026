/**
 * Boarding pass strip used in the layovers wallet tile.
 * Square corners (radius tokens are 0).
 */
export default function Pass({
  name,
  descriptor,
  flight,
  color,
  darkText = false,
  showMedia = false,
  thumb,
}: {
  name: string;
  descriptor: string;
  flight: string;
  color: string;
  darkText?: boolean;
  showMedia?: boolean;
  thumb?: string;
}) {
  const fg  = darkText ? "#232322" : "#fcfcfb";
  const fgD = darkText ? "rgba(35,35,34,0.70)" : "rgba(252,252,251,0.70)";

  return (
    <div className="overflow-hidden border border-grey-20/40">
      {/* header strip */}
      <div
        className="flex h-[72px] items-center justify-between px-3.5"
        style={{ background: color }}
      >
        <div className="min-w-0">
          <p
            className="truncate text-[1.125rem] font-semibold leading-snug"
            style={{ color: fg }}
          >
            {name}
          </p>
          <p
            className="truncate text-caption leading-normal"
            style={{ color: fgD }}
          >
            {descriptor}
          </p>
        </div>
        <div className="ml-3 shrink-0 text-right">
          <p className="label" style={{ color: fgD }}>FLIGHT</p>
          <p className="dot-code text-[17px]" style={{ color: fg }}>{flight}</p>
        </div>
      </div>

      {/* optional media area (only front pass in closed state) */}
      {showMedia && (
        <div className="aspect-[16/9] overflow-hidden bg-grey-10">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={name} className="size-full object-cover object-top" />
          ) : (
            <div className="size-full" style={{ background: color, opacity: 0.15 }} />
          )}
        </div>
      )}
    </div>
  );
}
