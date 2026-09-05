"use client";

import { useEffect, useState } from "react";

export type Section = { id: string; label: string };

/**
 * Sticky section nav, appears once the hero card scrolls past,
 * highlights the section currently in view.
 */
export default function StickyNav({
  code,
  sections,
  accent,
  next,
}: {
  code: string;
  sections: Section[];
  accent: string;
  next?: { href: string; label: string };
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  return (
    <div
      className={`sticky top-[4.4rem] z-30 -mx-6 mb-10 border-y border-grey-20 bg-grey-00/85 backdrop-blur-md transition-opacity duration-300 md:-mx-10 ${
        shown ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="container-content flex items-center gap-5 overflow-x-auto py-3">
        <span className="dot-code shrink-0 text-[13px] text-grey-90">
          {code}
        </span>
        <span className="h-4 w-px shrink-0 bg-grey-20" aria-hidden="true" />

        <nav className="flex items-center gap-5">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="label shrink-0 whitespace-nowrap transition-colors duration-200"
              style={{ color: active === s.id ? accent : "var(--color-grey-40)" }}
            >
              {s.label}
            </a>
          ))}
        </nav>

        {next && (
          <a
            href={next.href}
            className="label ml-auto shrink-0 whitespace-nowrap text-grey-40 transition-colors hover:text-grey-90"
          >
            {next.label} ↗
          </a>
        )}
      </div>
    </div>
  );
}
