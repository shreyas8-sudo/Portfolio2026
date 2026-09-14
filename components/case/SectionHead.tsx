/**
 * Section header for a case study.
 *
 * The label is underlined so sections are findable while scrolling. The
 * takeaway under it is the skim layer: someone who reads only the takeaways,
 * top to bottom, should get the whole case. Sections that are already a list
 * of points (takeaways, for one) pass no takeaway and just get the heading.
 */
export default function SectionHead({
  label,
  takeaway,
  accent,
}: {
  label: string;
  takeaway?: string;
  accent: string;
}) {
  return (
    <header>
      <h2 className="inline-block">
        <span
          className="label inline-block border-b-2 pb-2"
          style={{ color: accent, borderColor: accent }}
        >
          {label}
        </span>
      </h2>

      {takeaway && (
        /* no measure cap: at this size the column is about 54 characters a
           line, which a display heading carries fine, and a narrow heading
           over full-width body text read as two different grids. */
        <p className="mt-5 text-sub font-semibold text-grey-90 md:text-section">
          {takeaway}
        </p>
      )}
    </header>
  );
}
