"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Layover } from "@/lib/site";
import Viewer from "./Viewer";

/* ── touch detection ── */
function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setTouch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return touch;
}

/* ── grid column count from breakpoint ── */
function useColCount() {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setCols(3);
      else if (window.innerWidth >= 640) setCols(2);
      else setCols(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

/* ── compute explicit gridColumn / gridRow for expansion ──
   Anchors the card to its actual grid position so it never
   reflows (which would send the cursor outside the card and
   trigger an infinite collapse/expand loop on last-column cards). */
function computeExpandSpec(
  li: HTMLLIElement,
  colCount: number,
): { gridColumn: string; gridRow: string } | null {
  if (colCount <= 1) return null;
  const grid = li.parentElement as HTMLElement;
  if (!grid) return null;

  const gapPx = parseFloat(getComputedStyle(grid).columnGap) || 0;
  const colWidth = (grid.offsetWidth - gapPx * (colCount - 1)) / colCount;

  // Column (1-based): which column does this card's left edge fall in?
  const col = Math.min(colCount, Math.max(1, Math.round(li.offsetLeft / (colWidth + gapPx)) + 1));
  // Last column: grow left so the card never exits its current cell.
  const gridColumn = col === colCount ? `${col - 1} / span 2` : `${col} / span 2`;

  // Row (1-based): find unique offsetTop values across all siblings to
  // determine which row band this card is in (dense flow may reorder cards).
  const siblings = Array.from(grid.children) as HTMLElement[];
  const uniqueTops = [...new Set(siblings.map((s) => s.offsetTop))].sort((a, b) => a - b);
  const rowIdx = uniqueTops.indexOf(li.offsetTop);
  const row = rowIdx >= 0 ? rowIdx + 1 : 1;

  return { gridColumn, gridRow: `${row} / span 2` };
}

/* ── Ken Burns pan/scale variants (8 offsets so cards drift out of sync) ── */
const KB: { scale: [number, number]; x: [string, string]; y: [string, string] }[] = [
  { scale: [1, 1.06], x: ["0%", "-1.5%"],  y: ["0%", "-1%"]   },
  { scale: [1.06, 1], x: ["-1.5%", "0%"],  y: ["-1%", "0%"]   },
  { scale: [1, 1.06], x: ["0%", "1.5%"],   y: ["0%", "1%"]    },
  { scale: [1.06, 1], x: ["1.5%", "0%"],   y: ["1%", "0%"]    },
  { scale: [1, 1.06], x: ["-1%", "1%"],    y: ["0%", "-1.5%"] },
  { scale: [1.06, 1], x: ["1%", "-1%"],    y: ["-1.5%", "0%"] },
  { scale: [1, 1.06], x: ["0%", "-1%"],    y: ["1%", "-0.5%"] },
  { scale: [1.06, 1], x: ["-1%", "0%"],    y: ["-0.5%", "1%"] },
];

/* ── Thumbnail: video (IO-driven) or Ken Burns image ── */
function Thumb({
  item,
  kbIdx,
  reduced,
  onVideoRef,
}: {
  item: Layover;
  kbIdx: number;
  reduced: boolean;
  onVideoRef: (el: HTMLVideoElement | null) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const kb = KB[kbIdx % KB.length];

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-grey-05">
      {item.video ? (
        <video
          ref={onVideoRef}
          src={item.video}
          poster={item.poster ?? item.thumb}
          muted
          loop
          playsInline
          preload="metadata"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : !imgErr ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <motion.img
          src={item.thumb}
          alt={item.name}
          onError={() => setImgErr(true)}
          animate={reduced ? {} : { scale: kb.scale, x: kb.x, y: kb.y }}
          transition={reduced ? {} : {
            duration: 14,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
            delay: -(kbIdx % 8) * 1.75,
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          draggable={false}
        />
      ) : (
        <span
          className="absolute inset-0 grid place-items-center text-xs"
          style={{ color: "#a8a8a3", fontFamily: "var(--font-mono)" }}
        >
          {item.name}
        </span>
      )}
    </div>
  );
}

const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ViewerState = { item: Layover; rect: DOMRect };

type HoverSpec = { flight: string; gridColumn: string; gridRow: string };

export default function LayoverGrid({ items }: { items: Layover[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoverSpec, setHoverSpec] = useState<HoverSpec | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const isTouch = useIsTouch();
  const colCount = useColCount();
  const reduced = useReducedMotion() ?? false;

  const liRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const triggerRef = useRef<HTMLElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  /* Esc collapses expanded card */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Single IntersectionObserver drives all video play/pause */
  useEffect(() => {
    if (reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.25 },
    );
    videoRefs.current.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }); // intentionally runs every render so newly mounted videos are observed

  const toggle = (flight: string, el: HTMLElement) => {
    if (expanded === flight) {
      setExpanded(null);
      setHoverSpec(null);
      return;
    }
    const li = liRefs.current.get(flight);
    if (li) {
      const spec = computeExpandSpec(li, colCount);
      if (spec) setHoverSpec({ flight, ...spec });
    }
    triggerRef.current = el;
    setExpanded(flight);
  };

  const openViewer = (item: Layover, triggerEl: HTMLElement) => {
    const li = liRefs.current.get(item.flight);
    const rect = li?.getBoundingClientRect() ?? triggerEl.getBoundingClientRect();
    triggerRef.current = triggerEl;
    setViewer({ item, rect });
  };

  const openExternal = (url: string) => window.open(url, "_blank", "noreferrer");

  return (
    <>
      <ul
        className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        style={{ gridAutoFlow: "dense" }}
      >
        {items.map((item, idx) => {
          const isOn = (!isTouch && hovered === item.flight) || (isTouch && expanded === item.flight);
          /* "external only" = has external but no embed (embed takes priority for click) */
          const externalOnly = !!item.external && !item.embed;
          const hasAction = !!(item.embed || item.external);

          const doOpen = (el: HTMLElement) => {
            if (item.embed) openViewer(item, el);
            else if (item.external) openExternal(item.external);
          };

          const handleCardClick = (el: HTMLElement) => {
            if (isTouch) {
              /* first tap expands; second tap opens */
              if (expanded === item.flight) doOpen(el);
              else toggle(item.flight, el);
              return;
            }
            doOpen(el);
          };

          return (
            <motion.li
              key={item.flight}
              layout
              transition={reduced ? { duration: 0 } : { duration: 0.28, ease: EASING }}
              ref={(el) => {
                if (el) liRefs.current.set(item.flight, el);
                else liRefs.current.delete(item.flight);
              }}
              style={
                isOn && hoverSpec?.flight === item.flight
                  ? { gridColumn: hoverSpec.gridColumn, gridRow: hoverSpec.gridRow }
                  : undefined
              }
              onMouseEnter={() => {
                if (isTouch) return;
                if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
                const li = liRefs.current.get(item.flight);
                if (li) {
                  const spec = computeExpandSpec(li, colCount);
                  if (spec) setHoverSpec({ flight: item.flight, ...spec });
                }
                setHovered(item.flight);
              }}
              onMouseLeave={() => {
                if (isTouch) return;
                leaveTimer.current = setTimeout(() => {
                  setHovered(null);
                  setHoverSpec(null);
                  leaveTimer.current = null;
                }, 120);
              }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isOn}
                onClick={(e) => handleCardClick(e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCardClick(e.currentTarget); }
                }}
                className="flex h-full cursor-pointer flex-col overflow-hidden bg-grey-00"
                style={{
                  border: `1px solid ${isOn ? "#a8a8a3" : "#d6d6d2"}`,
                  boxShadow: isOn ? "0 2px 8px rgba(19,28,51,0.05)" : "none",
                  transform: isOn && !reduced ? "translateY(-3px)" : "translateY(0)",
                  cursor: hasAction ? "pointer" : "default",
                  transition: `border-color var(--dur-base) var(--ease-move), box-shadow var(--dur-base) var(--ease-move), transform var(--dur-base) var(--ease-move)`,
                }}
              >
                {/* thumbnail — video or Ken Burns image */}
                <Thumb
                  item={item}
                  kbIdx={idx}
                  reduced={reduced}
                  onVideoRef={(el) => {
                    if (el) videoRefs.current.set(item.flight, el);
                    else videoRefs.current.delete(item.flight);
                  }}
                />

                <div className="flex flex-1 flex-col px-4 py-3.5">
                  {/* meta row: date · origin · action icon */}
                  <div className="flex items-center gap-2">
                    <span style={{
                      fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "11px",
                      textTransform: "uppercase", letterSpacing: "0.04em", color: "#3d6bc4",
                    }}>
                      {item.date}
                    </span>
                    <span className="flex-1" />
                    <span style={{
                      fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "11px",
                      textTransform: "uppercase", letterSpacing: "0.04em", color: "#d97a2a",
                    }}>
                      {item.origin}
                    </span>
                    {hasAction && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const card = e.currentTarget.closest('[role="button"]') as HTMLElement | null;
                          doOpen(card ?? e.currentTarget);
                        }}
                        aria-label={externalOnly ? "Visit" : "Open"}
                        className="grid place-items-center"
                        style={{
                          width: "18px", height: "18px",
                          border: "1px solid #d6d6d2",
                          color: "#6e6e69", fontSize: "13px", lineHeight: 1,
                          flexShrink: 0, background: "transparent",
                          transition: `color var(--dur-base) var(--ease-move), border-color var(--dur-base) var(--ease-move)`,
                        }}
                      >
                        {externalOnly ? "↗" : "+"}
                      </button>
                    )}
                  </div>

                  {/* name */}
                  <p
                    className="mt-1.5"
                    style={{
                      fontFamily: "var(--font-sans)", fontWeight: 500,
                      fontSize: isOn ? "22px" : "14px", color: "#232322",
                      transition: reduced ? "none" : `font-size var(--dur-base) var(--ease-move)`,
                    }}
                  >
                    {item.name}
                    {externalOnly && (
                      <span style={{ fontSize: "11px", color: "#6e6e69", marginLeft: "4px" }} aria-hidden> ↗</span>
                    )}
                  </p>

                  {/* descriptor (collapsed only) */}
                  {!isOn && (
                    <p className="mt-0.5" style={{ fontSize: "14px", color: "#6e6e69" }}>
                      {item.descriptor}
                    </p>
                  )}

                  {/* expanded detail */}
                  <AnimatePresence initial={false}>
                    {isOn && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={reduced ? { duration: 0 } : { duration: 0.2 }}
                        className="mt-2 flex flex-col"
                        style={{ gap: "8px" }}
                      >
                        {item.blurb && (
                          <p style={{ fontSize: "14px", color: "#6e6e69", lineHeight: 1.55 }}>
                            {item.blurb}
                          </p>
                        )}
                        {item.meta && (
                          <p style={{
                            fontFamily: "var(--font-mono)", fontSize: "11px",
                            color: "#6e6e69", letterSpacing: "0.02em",
                          }}>
                            {item.meta}
                          </p>
                        )}
                        {hasAction && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const card = e.currentTarget.closest('[role="button"]') as HTMLElement | null;
                              doOpen(card ?? e.currentTarget);
                            }}
                            style={{
                              alignSelf: "flex-start",
                              fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500,
                              letterSpacing: "0.06em", textTransform: "uppercase",
                              color: "#3d6bc4", border: "1px solid #3d6bc4",
                              padding: "4px 10px", background: "transparent",
                              transition: `opacity var(--dur-base) var(--ease-move)`,
                            }}
                          >
                            {externalOnly ? "visit ↗" : "open"}
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>

      <Viewer
        open={!!viewer}
        item={viewer?.item ?? null}
        originRect={viewer?.rect ?? null}
        onClose={() => setViewer(null)}
        triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
      />
    </>
  );
}
