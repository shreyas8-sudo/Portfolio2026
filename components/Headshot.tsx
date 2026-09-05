"use client";

import { useState } from "react";

/** viewfinder corner brackets, sitting just outside the photo */
function Corners() {
  const base = "absolute size-7 border-[var(--color-blue)]";
  return (
    <>
      <span className={`${base} -left-2.5 -top-2.5 border-l-2 border-t-2`} />
      <span className={`${base} -right-2.5 -top-2.5 border-r-2 border-t-2`} />
      <span className={`${base} -bottom-2.5 -left-2.5 border-b-2 border-l-2`} />
      <span className={`${base} -bottom-2.5 -right-2.5 border-b-2 border-r-2`} />
    </>
  );
}

/**
 * Headshot, square photo inside blue viewfinder brackets.
 * Photo lives at public/media/about/headshot.webp.
 */
export default function Headshot() {
  const [missing, setMissing] = useState(false);

  return (
    <div className="relative w-full max-w-[13rem] shrink-0">
      <Corners />
      <div className="grid aspect-square w-full place-items-center overflow-hidden bg-gradient-to-b from-[#dfe5ee] to-[#eceeef]">
        {!missing ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/media/about/headshot.webp"
            alt="Shreya Shanmugam"
            className="size-full scale-[1.18] object-cover"
            onError={() => setMissing(true)}
          />
        ) : (
          <span className="label text-grey-40">headshot</span>
        )}
      </div>
    </div>
  );
}
