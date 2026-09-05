"use client";

import { useEffect, useState } from "react";

export type Section = {
  id: string;
  label: string;
  /** starts a new labelled group in the sidebar, e.g. a track */
  group?: string;
};

/**
 * Vertical section nav that sits beside the case study and tracks scroll.
 *
 * Sticky on large screens. On smaller ones it collapses to a horizontal
 * scrolling strip pinned under the header, since a sidebar has nowhere to go.
 */
export default function SideNav({
  code,
  sections,
  accent,
  backToTop = false,
}: {
  code: string;
  sections: Section[];
  accent: string;
  /** show a back-to-top control under the list once you're far enough down */
  backToTop?: boolean;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [deep, setDeep] = useState(false);

  useEffect(() => {
    if (!backToTop) return;
    const onScroll = () => setDeep(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [backToTop]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  const item = (s: Section) => {
    const on = active === s.id;
    return (
      <a
        key={s.id}
        href={`#${s.id}`}
        aria-current={on ? "true" : undefined}
        className="label group flex shrink-0 items-center gap-2 whitespace-nowrap py-1.5 transition-colors duration-200"
        style={{ color: on ? accent : "var(--color-grey-40)" }}
      >
        {/* the marker grows into a bar for the section you're in */}
        <span
          aria-hidden="true"
          className="h-px transition-all duration-300"
          style={{
            width: on ? 16 : 6,
            background: on ? accent : "var(--color-grey-20)",
          }}
        />
        {s.label}
      </a>
    );
  };

  return (
    <>
      {/* desktop, a real sidebar */}
      <nav className="hidden lg:block">
        <div className="sticky top-28">
          <p className="dot-code text-[13px] text-grey-90">{code}</p>
          <div className="mt-4 flex flex-col items-start gap-0.5">
            {sections.map((s) => (
              <div key={s.id} className="contents">
                {s.group && (
                  <p className="label mb-1 mt-4 text-grey-20 first:mt-0">
                    {s.group}
                  </p>
                )}
                {item(s)}
              </div>
            ))}
          </div>

          {backToTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={`label mt-5 flex items-center gap-2 border-t border-grey-10 pt-4 text-grey-40 transition-all duration-300 hover:text-grey-90 ${
                deep ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <span style={{ color: accent }} aria-hidden="true">
                ↑
              </span>
              back to top
            </button>
          )}
        </div>
      </nav>

      {/* below lg, a pinned strip */}
      <nav className="sticky top-[4.4rem] z-30 -mx-6 mb-8 border-y border-grey-20 bg-grey-00/85 px-6 backdrop-blur-md md:-mx-10 md:px-10 lg:hidden">
        <div className="flex items-center gap-5 overflow-x-auto py-3">
          {sections.map(item)}
        </div>
      </nav>
    </>
  );
}
