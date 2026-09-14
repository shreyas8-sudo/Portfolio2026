"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Plane from "@/components/Plane";

/** Way out of a case study, back to the work on the home page. */
export function BackToWork({ accent }: { accent: string }) {
  return (
    <Link
      href="/#work"
      className="group inline-flex items-center gap-2 text-caption text-grey-60 transition-colors duration-200 hover:text-grey-90"
    >
      <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:-translate-x-1"
        style={{ color: accent }}
      >
        ←
      </span>
      back to all work
    </Link>
  );
}

/** Back-to-top pill, appears after a bit of scrolling. */
export function BackToTop({ accent }: { accent: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex justify-end">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`inline-flex items-center gap-2 rounded-[--radius-pill] border border-grey-20 bg-grey-00 px-4 py-2 transition-all duration-300 hover:border-grey-40 ${
          shown ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span style={{ color: accent }}>↑</span>
        <span className="label text-grey-60">back to top</span>
      </button>
    </div>
  );
}

/** Next-case-study nav strip. */
export function NextFlight({
  href,
  code,
  flight,
  title,
  accent,
  logo,
}: {
  href: string;
  code: string;
  flight: string;
  title: string;
  accent: string;
  /** the next case study's mark, so you can see where you're going */
  logo?: string;
}) {
  return (
    <Link
      href={href}
      className="group mt-16 block border-t border-grey-20 bg-grey-05 py-10"
    >
      {/* On a phone this stacks: mark, then the name of where you're going.
          The plane goes, because at this width it is the widest thing in the
          row and it is the only thing in it carrying no information. */}
      <div className="container-content flex items-start gap-4 sm:items-center sm:gap-6">
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            className="size-10 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 sm:size-12"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="label text-grey-40">Next flight</p>
          <p className="mt-1.5 text-[1.0625rem] font-medium leading-snug text-grey-90 sm:text-sub">
            {title}
          </p>
          <p className="mt-1.5 flex items-center gap-2.5">
            <span className="dot-code text-[13px] text-grey-60">{code}</span>
            <span className="dot-code text-[13px]" style={{ color: accent }}>
              {flight}
            </span>
          </p>
        </div>
        <span className="hidden transition-transform duration-300 group-hover:translate-x-1 lg:block">
          <Plane width={64} climb={-18} />
        </span>
        <span
          className="shrink-0 text-2xl transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          style={{ color: accent }}
          aria-hidden="true"
        >
          ↗
        </span>
      </div>
    </Link>
  );
}
