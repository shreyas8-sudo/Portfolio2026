/**
 * Divider that opens each of the two tracks in the Synechron case.
 *
 * The case is two jobs held at once, so it needs a break the eye can't miss
 * between them, rather than another section heading in the same rhythm.
 */
export default function TrackBanner({
  n,
  title,
  blurb,
  accent,
  first = false,
}: {
  n: string;
  title?: string;
  blurb: string;
  accent: string;
  /** the first track opens the body, so it needs no gap above it */
  first?: boolean;
}) {
  return (
    <div
      className={`border-t-2 pt-6 ${first ? "" : "mt-20"}`}
      style={{ borderColor: accent }}
    >
      <div className="flex items-baseline gap-4">
        <span className="dot-code text-[15px]" style={{ color: accent }}>
          TRACK {n}
        </span>
        <span className="h-px flex-1 bg-grey-10" aria-hidden="true" />
      </div>
      {title && (
        <h2 className="mt-3 text-title font-semibold tracking-[-0.025em] text-grey-90">
          {title}
        </h2>
      )}
      <p
        className={`max-w-[52ch] text-grey-60 ${
          title ? "mt-2.5 text-body-lg" : "mt-3 text-section font-semibold tracking-[-0.02em] text-grey-90"
        }`}
      >
        {blurb}
      </p>
    </div>
  );
}
