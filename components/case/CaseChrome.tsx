"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Plane from "@/components/Plane";

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
}: {
  href: string;
  code: string;
  flight: string;
  title: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group mt-16 block border-t border-grey-20 bg-grey-05 py-10"
    >
      <div className="container-content flex items-center gap-6">
        <div className="flex-1">
          <p className="label text-grey-40">Next flight</p>
          <p className="mt-1.5 text-sub font-medium text-grey-90">{title}</p>
          <p className="mt-1.5 flex items-center gap-2.5">
            <span className="dot-code text-[13px] text-grey-60">{code}</span>
            <span className="dot-code text-[13px]" style={{ color: accent }}>
              {flight}
            </span>
          </p>
        </div>
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          <Plane width={64} climb={-18} />
        </span>
        <span
          className="text-2xl transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          style={{ color: accent }}
          aria-hidden="true"
        >
          ↗
        </span>
      </div>
    </Link>
  );
}
