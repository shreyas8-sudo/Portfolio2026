"use client";

import { useState } from "react";

/**
 * Takeaways as an accordion. The headings alone are the skim layer, so the
 * section stays short, and the reasoning is one click away for whoever wants it.
 */
export default function Takeaways({
  items,
  accent,
}: {
  items: [string, string][];
  accent: string;
}) {
  /* all closed on arrival: the headings are the section, and opening one
     should be the reader's decision, not a default we made for them. */
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ul className="mt-7 border-t border-grey-10">
      {items.map(([head, body], i) => {
        const on = open === i;
        return (
          <li key={head} className="border-b border-grey-10">
            <h3>
              <button
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                className="group flex w-full items-start gap-4 py-5 text-left"
              >
                <span
                  aria-hidden="true"
                  className="relative mt-1.5 size-3.5 shrink-0"
                  style={{ color: accent }}
                >
                  {/* a plus that becomes a minus, drawn rather than swapped */}
                  <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current" />
                  <span
                    className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-current transition-transform duration-300"
                    style={{ transform: on ? "scaleY(0)" : "scaleY(1)" }}
                  />
                </span>

                <span className="flex-1 text-sub font-medium text-grey-90">
                  {head}
                </span>
              </button>
            </h3>

            <div
              className="grid transition-all duration-300 ease-out"
              style={{
                gridTemplateRows: on ? "1fr" : "0fr",
                opacity: on ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <p className="max-w-[68ch] pb-6 pl-[1.875rem] text-body text-grey-60">
                  {body}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
