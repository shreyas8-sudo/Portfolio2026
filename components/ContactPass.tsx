"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { site } from "@/lib/site";
import Plane from "./Plane";

/** A plain, non-linked row, for facts rather than destinations. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 border-t border-grey-10 py-2.5 first:border-t-0">
      <span className="label w-16 shrink-0 text-grey-40">{label}</span>
      <span className="flex-1 truncate text-right font-mono text-[12px] text-grey-90">
        {value}
      </span>
      <span className="w-[11px]" aria-hidden="true" />
    </div>
  );
}

function Row({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noreferrer"
      className="group flex items-center gap-4 border-t border-grey-10 py-2.5 first:border-t-0"
    >
      <span className="label w-16 shrink-0 text-grey-40">{label}</span>
      <span
        className="flex-1 truncate text-right font-mono text-[12px]"
        style={{ color: "var(--color-blue)" }}
      >
        {value}
      </span>
      <span
        className="text-[11px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        style={{ color: "var(--color-blue)" }}
        aria-hidden="true"
      >
        ↗
      </span>
    </a>
  );
}

/**
 * Contact, a panel anchored under the nav's contact button.
 * Not a modal: the page stays visible and bright behind it.
 * Closes on X, click-outside, or Escape.
 */
export default function ContactPass({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t)) {
        // ignore clicks on the trigger itself, nav handles the toggle
        if ((t as HTMLElement).closest?.("[data-contact-trigger]")) return;
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label="Contact"
          initial={{ opacity: 0, y: -6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.995 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-6 top-[4.75rem] z-50 w-[21rem] overflow-hidden rounded-[--radius-card] border border-grey-20 bg-grey-00 shadow-[0_12px_36px_rgba(19,28,51,0.13)] md:right-10"
        >
          {/* header, dark navy banner */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#131c33] to-[#24365c] px-4 py-3">
            <span className="flex items-center gap-2.5">
              <Plane width={22} climb={-18} />
              <span className="label text-white">{site.name}</span>
            </span>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="grid size-6 place-items-center rounded text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1L11 11M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* route panel, dashed, like the boarding pass */}
          <div className="m-3 rounded-[--radius-sharp] border border-dashed border-grey-20 bg-gradient-to-b from-[#eef2f8] to-[#f6f6f4] px-4 pb-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="label text-grey-40">Route</span>
              <span className="rounded-[3px] border border-grey-20 px-1.5 py-0.5">
                <span className="label text-grey-60">2027</span>
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="dot-code text-[26px] text-grey-90">LAX</span>
              <svg width="46" height="12" viewBox="0 0 46 12" fill="none">
                <path
                  d="M1 6 H31"
                  stroke="rgba(35,35,34,0.22)"
                  strokeWidth="1.2"
                  strokeDasharray="2 5"
                  strokeLinecap="round"
                />
                <path
                  d="M29 2 L37 6 L29 10"
                  stroke="var(--color-orange)"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span
                className="dot-code text-[26px]"
                style={{ color: "var(--color-orange)" }}
              >
                ???
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <span className="label text-grey-40">hyderabad</span>
              <span className="label text-grey-40">destination tbd</span>
            </div>
          </div>

          {/* details */}
          <div className="px-4 pb-1">
            <Fact label="Role" value="Product Designer" />
            <Row label="Email" value={site.email} href={`mailto:${site.email}`} />
            <Row
              label="LI"
              value="linkedin.com/in/shreyaa-shanmugam"
              href={site.linkedin}
            />
            <Row label="Beli" value="beli/shreyas" href={site.beli} />
          </div>

          {/* footer strip */}
          <div className="mt-2 border-t border-grey-10 bg-grey-05 px-4 py-2.5">
            <span className="label text-grey-40">
              Based in Los Angeles · open to 2027
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
