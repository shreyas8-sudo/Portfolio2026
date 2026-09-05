"use client";

import { useState } from "react";
import Link from "next/link";
import type { CaseStudy } from "@/lib/site";
import CaseCover from "./CaseCover";
import Arrow from "./Arrow";

/**
 * Case card, static cover, video plays on hover.
 * Labels are luggage tags: origin (outline) + status (filled orange).
 */
export default function CaseCard({ study }: { study: CaseStudy }) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={`/${study.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group block overflow-hidden rounded-[--radius-panel] border border-grey-20 bg-grey-00 transition-shadow duration-300 hover:shadow-[0_4px_18px_rgba(0,0,0,0.045)]"
    >
      <CaseCover
        poster={study.cover.poster}
        video={study.cover.video}
        flight={study.flight}
        code={study.code}
        accent={study.accent}
        playing={hover}
      />

      <div className="px-6 py-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="dot-code text-[13px] text-grey-90">{study.code}</span>
          <span className="dot-code text-[13px]" style={{ color: study.accent }}>
            {study.flight}
          </span>

          <span className="ml-auto flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 rounded-[--radius-tag] border px-2 py-[3px]"
              style={{ borderColor: study.accent }}
            >
              <span className="label" style={{ color: study.accent }}>
                {study.origin}
              </span>
            </span>
            <span
              className="flex items-center gap-1.5 rounded-[--radius-tag] px-2 py-[3px]"
              style={{ background: "var(--color-orange)" }}
            >
              <span className="label text-white">
                ✈ {study.status} {study.year}
              </span>
            </span>
          </span>
        </div>

        <h3 className="mt-2.5 text-sub font-semibold text-grey-90">
          {study.title}
        </h3>
        <p className="mt-2 max-w-[62ch] text-caption text-grey-60">
          {study.summary}
        </p>

        <span className="arrow-link mt-3" style={{ color: study.accent }}>
          <span>read the case study</span>
          <Arrow color={study.accent} />
        </span>
      </div>
    </Link>
  );
}
