/**
 * Logo. The same marker used on the travel map, ring plus filled centre,
 * with SS set into the middle.
 *
 * The fill is the footer's navy gradient with a soft top-left highlight,
 * so the disc reads as slightly domed rather than flat.
 */
export default function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Shreya Shanmugam, home"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="ss-disc" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#3b5384" />
          <stop offset="46%" stopColor="#1e2d50" />
          <stop offset="100%" stopColor="#131c33" />
        </linearGradient>
        <radialGradient id="ss-dome" cx="0.34" cy="0.26" r="0.68">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* outer ring, same gesture as an unselected pin on the map */}
      <circle
        cx="12"
        cy="12"
        r="11.1"
        fill="none"
        stroke="#1e2d50"
        strokeWidth="0.9"
        opacity="0.32"
      />

      {/* the marker itself */}
      <circle cx="12" cy="12" r="8.7" fill="url(#ss-disc)" />
      <circle cx="12" cy="12" r="8.7" fill="url(#ss-dome)" />

      <text
        x="12"
        y="12.15"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--color-grey-00)"
        fontSize="8.2"
        fontWeight="600"
        letterSpacing="-0.35"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        SS
      </text>
    </svg>
  );
}
