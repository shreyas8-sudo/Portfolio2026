/**
 * Marker-pen highlight, in the case study's own accent.
 *
 * Used for the sentence in a section you'd want someone to remember if they
 * read nothing else. The tint is derived from the accent at low alpha so it
 * stays legible in both cases without a second colour token.
 */
export default function Mark({
  children,
  tint,
}: {
  children: React.ReactNode;
  /** rgba of the case accent, around 0.14 alpha */
  tint: string;
}) {
  return (
    <mark
      className="rounded-[2px] px-1.5 py-0.5 font-medium text-grey-90"
      style={{ background: tint }}
    >
      {children}
    </mark>
  );
}
