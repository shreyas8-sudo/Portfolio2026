"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "work" | "school" | "tools";

type Row = { year: string; org: string; role: string };

const work: Row[] = [
  {
    year: "2026",
    org: "Synechron",
    role: "UI/UX Product Design Intern · NYC",
  },
  {
    year: "2026",
    org: "USC Annenberg Media",
    role: "Product Manager",
  },
  {
    year: "2025",
    org: "Basis / LavaLab",
    role: "Co-founder & founding designer · LA",
  },
  {
    year: "2025",
    org: "Fly Fearless",
    role: "Web design intern",
  },
  {
    year: "2024",
    org: "Neoboard",
    role: "UI/UX design intern",
  },
];

const school: Row[] = [
  {
    year: "2025-27",
    org: "University of Southern California",
    role: "B.S. in Business (Finance), Marshall School of Business · Minor in Designing for Digital Experiences, Iovine and Young Academy",
  },
  {
    year: "2023-24",
    org: "Indiana University Bloomington",
    role: "B.S. Business Administration (transferred out)",
  },
];

const tools = [
  {
    group: "Design",
    items: [
      "Figma",
      "Figma Make",
      "Figma Motion",
      "Figma Agents",
      "Framer",
      "Adobe Suite",
      "Claude Design",
    ],
  },
  {
    group: "Build",
    items: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Next.js",
      "Google Maps API",
      "Git",
      "Claude Code",
      "Cursor",
      "Vercel",
      "Lovable",
    ],
  },
  {
    group: "AI",
    items: ["Claude", "ChatGPT", "Google Stitch", "Midjourney", "Adobe Firefly"],
  },
];

/* ── icons ─────────────────────────────────────────── */
const Icon = {
  work: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="4.5" width="13" height="9.5" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 4.5V3.2c0-.6.5-1.2 1.2-1.2h2.6c.7 0 1.2.6 1.2 1.2v1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M1.5 8.4h13" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  school: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M8 4.4S6.6 3 4.2 3H1.8v9.4h2.4C6.6 12.4 8 13.6 8 13.6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 4.4S9.4 3 11.8 3h2.4v9.4h-2.4c-2.4 0-3.8 1.2-3.8 1.2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 4.4v9.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  tools: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M10.2 2.6a3.2 3.2 0 0 0-3.6 4.5L2.5 11.2a1.3 1.3 0 0 0 1.9 1.9l4.1-4.1a3.2 3.2 0 0 0 4.5-3.6l-1.9 1.9-1.9-.5-.5-1.9 1.5-1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  ),
};

const TABS: { id: Tab; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "school", label: "School" },
  { id: "tools", label: "Tools" },
];

function Rows({ rows }: { rows: Row[] }) {
  return (
    <ul>
      {rows.map((r) => (
        <li
          key={`${r.org}-${r.year}`}
          className="group flex flex-col gap-1 border-t border-grey-10 py-3.5 sm:flex-row sm:items-center sm:gap-5"
        >
          <span className="dot-code w-20 shrink-0 text-[13px] text-grey-40">
            {r.year}
          </span>
          <span className="w-full shrink-0 text-caption font-medium text-grey-90 sm:w-60">
            {r.org}
          </span>
          <span className="flex-1 text-caption text-grey-60 transition-colors duration-300 group-hover:text-grey-90">
            {r.role}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function TheRecord() {
  const [tab, setTab] = useState<Tab>("work");

  return (
    <div className="mt-6">
      <div className="inline-flex rounded-[--radius-card] border border-grey-20 bg-grey-05 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`flex items-center gap-2 rounded-[6px] px-4 py-1.5 transition-all duration-200 ${
              tab === t.id
                ? "bg-grey-00 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                : "hover:bg-grey-10/60"
            }`}
          >
            <span
              className={
                tab === t.id ? "text-[var(--color-blue)]" : "text-grey-40"
              }
            >
              {Icon[t.id]}
            </span>
            <span
              className={`label ${tab === t.id ? "text-grey-90" : "text-grey-40"}`}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 min-h-[13rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {tab === "work" && <Rows rows={work} />}
            {tab === "school" && <Rows rows={school} />}
            {tab === "tools" && (
              <ul>
                {tools.map((t) => (
                  <li
                    key={t.group}
                    className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-grey-10 py-3.5"
                  >
                    <span className="label w-20 shrink-0 text-grey-40">
                      {t.group}
                    </span>
                    <span className="flex flex-wrap gap-2">
                      {t.items.map((i) => (
                        <span
                          key={i}
                          className="rounded-[--radius-tag] border border-grey-20 px-2.5 py-1 text-[12px] text-grey-60 transition-colors duration-200 hover:border-grey-40 hover:text-grey-90"
                        >
                          {i}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
