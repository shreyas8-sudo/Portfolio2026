/**
 * Airplane window.
 * Three layers, outside in: dashed stitch line → cream bezel → glass.
 * Used empty ("click on any pin") and filled (a photo of that place).
 */
export default function Window({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[15rem] ${className}`}
      style={{ aspectRatio: "4 / 5" }}
    >
      {/* stitch line */}
      <div
        className="absolute inset-0 border border-dashed border-white/22"
        style={{ borderRadius: "46% / 38%" }}
      />

      {/* cream bezel */}
      <div
        className="absolute inset-[7%] bg-[#e9e6df] shadow-[0_2px_14px_rgba(0,0,0,0.28)]"
        style={{ borderRadius: "46% / 38%" }}
      >
        {/* glass */}
        <div
          className="absolute inset-[6.5%] overflow-hidden bg-gradient-to-b from-[#7fabe6] to-[#6b9bdb] shadow-[inset_0_3px_14px_rgba(0,0,0,0.30)]"
          style={{ borderRadius: "45% / 37%" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
