"use client";

import { useEffect, useRef, useState } from "react";
import Plane from "./Plane";

/**
 * Case cover.
 * Static poster by default → video plays on hover/focus of the parent card.
 * If media is missing, renders a *designed* placeholder rather than a grey void,
 * so the page reads as intentional before real footage exists.
 */
export default function CaseCover({
  poster,
  video,
  flight,
  code,
  accent,
  playing,
}: {
  poster: string;
  /** omit for a still-only cover */
  video?: string;
  flight: string;
  code: string;
  accent: string;
  playing: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hasMedia, setHasMedia] = useState(true);
  /* below desktop there is no hover to reveal the loop with, so it just runs */
  const [always, setAlways] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px), (hover: none)");
    const sync = () => setAlways(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !hasMedia || !video) return;
    if (playing || always) v.play().catch(() => {});
    else {
      v.pause();
      v.currentTime = 0;
    }
  }, [playing, always, hasMedia, video]);

  /* Belt and braces on top of the loop attribute. With preload="none" the
     first hover starts playback while the file is still streaming, and a
     browser that reaches the end without a known duration fires `ended`
     instead of looping. Restart it ourselves if that happens. */
  const onEnded = () => {
    const v = ref.current;
    if (!v || !(playing || always)) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-grey-05">
      {hasMedia && video ? (
        <video
          ref={ref}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay={always}
          /* metadata, not none: the duration has to be known before the first
             hover or the loop has nothing to loop against */
          preload={always ? "auto" : "metadata"}
          onEnded={onEnded}
          onError={() => setHasMedia(false)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : hasMedia ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          onError={() => setHasMedia(false)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
        />
      ) : (
        /* designed placeholder */
        <div
          className="relative size-full"
          style={{
            background:
              "linear-gradient(135deg, #e6ebf2 0%, #f1f1ef 55%, #f7f6f3 100%)",
          }}
        >
          {/* faint dashed flight path */}
          <svg
            className="absolute inset-0 size-full"
            viewBox="0 0 800 450"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M60 370 C240 340, 420 260, 560 150"
              fill="none"
              stroke="rgba(35,35,34,0.16)"
              strokeWidth="2"
              strokeDasharray="2 9"
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute right-8 top-7">
            <Plane width={68} tone="grey" climb={-20} />
          </div>

          <div className="absolute bottom-6 left-8">
            <p className="dot-code text-[20px]" style={{ color: accent }}>
              {flight}
            </p>
            <p className="label mt-1 text-grey-40">{code} · cover pending</p>
          </div>
        </div>
      )}
    </div>
  );
}
