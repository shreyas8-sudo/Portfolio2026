"use client";

import { useState } from "react";

/**
 * Photo whose caption is held back until hover, so a row of them reads as
 * images first and explains itself only if you ask.
 */
export default function HoverFigure({
  src,
  caption,
  ratio = "4/3",
}: {
  src: string;
  caption: string;
  ratio?: string;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <figure className="group w-full">
      <div
        className="relative w-full overflow-hidden rounded-[--radius-card] border border-grey-20 bg-gradient-to-br from-[#eaeee9] to-[#f6f6f4]"
        style={{ aspectRatio: ratio }}
      >
        {missing ? (
          <div className="grid size-full place-items-center">
            <span className="label text-grey-40">photo pending</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={caption}
            onError={() => setMissing(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}

        {/* held back until hover, but only where hovering exists */}
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3.5 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          <span className="text-caption text-white">{caption}</span>
        </figcaption>
      </div>

      {/* on touch there is no hover to reveal it with, so it just sits there */}
      <figcaption className="mt-2.5 text-caption text-grey-60 md:hidden">
        {caption}
      </figcaption>
    </figure>
  );
}
