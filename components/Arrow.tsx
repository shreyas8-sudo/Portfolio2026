/**
 * The arrow that follows every link on the site.
 *
 * At rest it is just the diagonal head. On hover of the parent .arrow-link
 * a tail draws itself out of the text and pushes the head to the right.
 * The tail is a plain element rather than an SVG path so it always meets
 * the head exactly, at any width, with no distortion.
 *
 * Span-only on purpose, so it can sit inside a card that is already a link.
 */
export default function Arrow({ color }: { color: string }) {
  return (
    <span className="arrow-line" aria-hidden="true">
      <span className="arrow-tail" style={{ background: color }} />
      <svg className="arrow-head" viewBox="0 0 12 12" fill="none">
        <path
          d="M0.9 11.1 L10.6 1.4 M4.2 1.4 L10.6 1.4 L10.6 7.8"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
