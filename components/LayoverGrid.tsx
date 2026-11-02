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

/* ── Ken Burns pan/scale variants ── */
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

/* ── Grid card thumbnail (IO-controlled video or Ken Burns image) ── */
function Thumb({
  item, kbIdx, reduced, onVideoRef,
}: {
  item: Layover; kbIdx: number; reduced: boolean;
  onVideoRef: (el: HTMLVideoElement | null) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const kb = KB[kbIdx % KB.length];
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-grey-05">
      {item.video ? (
        <video ref={onVideoRef} src={item.video} poster={item.poster ?? item.thumb}
          muted loop playsInline preload="metadata"
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : !imgErr ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <motion.img src={item.thumb} alt={item.name} onError={() => setImgErr(true)}
          animate={reduced ? {} : { scale: kb.scale, x: kb.x, y: kb.y }}
          transition={reduced ? {} : { duration: 14, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: -(kbIdx % 8) * 1.75 }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-xs"
          style={{ color: "#a8a8a3", fontFamily: "var(--font-mono)" }}>
          {item.name}
        </span>
      )}
    </div>
  );
}

/* ── Overlay thumbnail: autoplays on mount ── */
function OverlayThumb({ item, kbIdx, reduced }: { item: Layover; kbIdx: number; reduced: boolean }) {
  const [imgErr, setImgErr] = useState(false);
  const kb = KB[kbIdx % KB.length];
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { videoRef.current?.play().catch(() => {}); }, []);
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-grey-05" style={{ flexShrink: 0 }}>
      {item.video ? (
        <video ref={videoRef} src={item.video} poster={item.poster ?? item.thumb}
          muted loop playsInline preload="metadata"
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : !imgErr ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <motion.img src={item.thumb} alt={item.name} onError={() => setImgErr(true)}
          animate={reduced ? {} : { scale: kb.scale, x: kb.x, y: kb.y }}
          transition={reduced ? {} : { duration: 14, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: -(kbIdx % 8) * 1.75 }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-xs"
          style={{ color: "#a8a8a3", fontFamily: "var(--font-mono)" }}>
          {item.name}
        </span>
      )}
    </div>
  );
}

const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];
type ViewerState = { item: Layover; rect: DOMRect };

/* ── Overlay spec: card's slot + where it grows ── */
type OverlaySpec = {
  flight: string;
  item: Layover;
  idx: number;
  /* transform offset so overlay STARTS at the card's slot position */
  dx: number; dy: number;
  initW: number; initH: number;
  /* final absolute position (within wrapper) and size */
  left: number; top: number;
  w: number; h: number;
};

function computeOverlay(
  li: HTMLLIElement,
  wrapper: HTMLElement,
  item: Layover,
  idx: number,
): OverlaySpec {
  const wRect = wrapper.getBoundingClientRect();
  const liRect = li.getBoundingClientRect();
  const grid = li.parentElement as HTMLElement;
  const gs = getComputedStyle(grid);

  const slotLeft = liRect.left - wRect.left;
  const slotTop  = liRect.top  - wRect.top;
  const slotW    = liRect.width;
  const slotH    = liRect.height;

  const colGap  = parseFloat(gs.columnGap) || 0;
  const rowGap  = parseFloat(gs.rowGap)    || 0;
  const numCols = gs.gridTemplateColumns.trim().split(/\s+/).length;

  const overlayW = slotW * 2 + colGap;
  const overlayH = slotH * 2 + rowGap;

  /* which column (1-based) */
  const col = Math.min(numCols, Math.max(1, Math.round(slotLeft / (slotW + colGap)) + 1));

  /* which row (1-based) via unique viewport-relative top values */
  const siblings = Array.from(grid.children) as HTMLElement[];
  const wTop = wRect.top;
  const uniqueTops = [
    ...new Set(siblings.map((s) => Math.round(s.getBoundingClientRect().top - wTop))),
  ].sort((a, b) => a - b);
  const myTop  = Math.round(liRect.top - wTop);
  const rowIdx = uniqueTops.findIndex((t) => Math.abs(t - myTop) < 5);
  const row    = rowIdx >= 0 ? rowIdx + 1 : 1;
  const numRows = uniqueTops.length;

  /* last column grows left; last row grows up */
  const finalLeft = col === numCols ? slotLeft - slotW - colGap : slotLeft;
  const finalTop  = row === numRows ? slotTop  - slotH - rowGap : slotTop;

  return {
    flight: item.flight, item, idx,
    dx: slotLeft - finalLeft,
    dy: slotTop  - finalTop,
    initW: slotW, initH: slotH,
    left: finalLeft, top: finalTop,
    w: overlayW, h: overlayH,
  };
}

/* ── Overlay card component ── */
function OverlayCard({
  spec, reduced,
  onOpen, onExternal, onMouseEnter, onMouseLeave,
}: {
  spec: OverlaySpec; reduced: boolean;
  onOpen: (el: HTMLElement) => void;
  onExternal: (url: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const { item, idx, dx, dy, initW, initH, left, top, w, h } = spec;
  const externalOnly = !!item.external && !item.embed;
  const hasAction = !!(item.embed || item.external);

  const doOpen = (el: HTMLElement) => {
    if (item.embed) onOpen(el);
    else if (item.external) onExternal(item.external);
  };

  return (
    <motion.div
      initial={{ x: dx, y: dy, width: initW, height: initH }}
      animate={{ x: 0, y: 0, width: w, height: h }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={reduced ? { duration: 0 } : { duration: 0.28, ease: EASING }}
      style={{
        position: "absolute", left, top, zIndex: 20, overflow: "hidden",
        boxShadow: "0 12px 32px rgba(19,28,51,0.14)",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        role="button" tabIndex={0}
        onClick={(e) => doOpen(e.currentTarget)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doOpen(e.currentTarget); } }}
        className="flex flex-col bg-grey-00"
        style={{
          height: "100%", border: "1px solid #a8a8a3",
          cursor: hasAction ? "pointer" : "default",
          boxShadow: "0 2px 8px rgba(19,28,51,0.05)",
        }}
      >
        <OverlayThumb item={item} kbIdx={idx} reduced={reduced} />

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3.5">
          {/* meta row */}
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", color: "#3d6bc4" }}>
              {item.date}
            </span>
            <span className="flex-1" />
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", color: "#d97a2a" }}>
              {item.origin}
            </span>
            {hasAction && (
              <button
                onClick={(e) => { e.stopPropagation(); doOpen(e.currentTarget); }}
                aria-label={externalOnly ? "Visit" : "Open"}
                className="grid place-items-center"
                style={{ width: "18px", height: "18px", border: "1px solid #a8a8a3", color: "#6e6e69", fontSize: "13px", lineHeight: 1, flexShrink: 0, background: "transparent" }}
              >
                {externalOnly ? "↗" : "+"}
              </button>
            )}
          </div>

          {/* name */}
          <p className="mt-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "22px", color: "#232322" }}>
            {item.name}
            {externalOnly && <span style={{ fontSize: "11px", color: "#6e6e69", marginLeft: "4px" }} aria-hidden> ↗</span>}
          </p>

          {item.blurb && (
            <p className="mt-2" style={{ fontSize: "14px", color: "#6e6e69", lineHeight: 1.55 }}>
              {item.blurb}
            </p>
          )}
          {item.meta && (
            <p className="mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#6e6e69", letterSpacing: "0.02em" }}>
              {item.meta}
            </p>
          )}
          {hasAction && (
            <button
              onClick={(e) => { e.stopPropagation(); doOpen(e.currentTarget); }}
              style={{
                marginTop: "8px", alignSelf: "flex-start",
                fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500,
                letterSpacing: "0.06em", textTransform: "uppercase",
                color: "#3d6bc4", border: "1px solid #3d6bc4",
                padding: "4px 10px", background: "transparent",
              }}
            >
              {externalOnly ? "visit ↗" : "open"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main grid ── */
export default function LayoverGrid({ items }: { items: Layover[] }) {
  const [expanded, setExpanded] = useState<string | null>(null); // touch only
  const [overlay, setOverlay]   = useState<OverlaySpec | null>(null);
  const [viewer,  setViewer]    = useState<ViewerState | null>(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion() ?? false;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const liRefs     = useRef<Map<string, HTMLLIElement>>(new Map());
  const triggerRef = useRef<HTMLElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRefs  = useRef<Map<string, HTMLVideoElement>>(new Map());

  /* Esc closes everything */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setExpanded(null); setOverlay(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Single IO drives all grid card videos */
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
  });

  const cancelLeave = () => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
  };
  const scheduleClose = () => {
    leaveTimer.current = setTimeout(() => { setOverlay(null); leaveTimer.current = null; }, 120);
  };

  const openViewer = (item: Layover, triggerEl: HTMLElement) => {
    setOverlay(null);
    const li = liRefs.current.get(item.flight);
    const rect = li?.getBoundingClientRect() ?? triggerEl.getBoundingClientRect();
    triggerRef.current = li ?? triggerEl;
    setViewer({ item, rect });
  };
  const openExternal = (url: string) => window.open(url, "_blank", "noreferrer");

  return (
    <>
      <div ref={wrapperRef} style={{ position: "relative" }}>
        <ul
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gridAutoFlow: "dense" }}
        >
          {items.map((item, idx) => {
            const touchOn     = isTouch && expanded === item.flight;
            const externalOnly = !!item.external && !item.embed;
            const hasAction    = !!(item.embed || item.external);

            const doOpen = (el: HTMLElement) => {
              if (item.embed) openViewer(item, el);
              else if (item.external) openExternal(item.external);
            };

            const handleClick = (el: HTMLElement) => {
              if (isTouch) {
                if (expanded === item.flight) doOpen(el);
                else { triggerRef.current = el; setExpanded(item.flight); }
                return;
              }
              doOpen(el);
            };

            return (
              <li
                key={item.flight}
                ref={(el) => {
                  if (el) liRefs.current.set(item.flight, el);
                  else liRefs.current.delete(item.flight);
                }}
                /* disable pointer events while this card's overlay is showing */
                style={{ pointerEvents: overlay?.flight === item.flight ? "none" : undefined }}
                onMouseEnter={() => {
                  if (isTouch) return;
                  cancelLeave();
                  if (overlay?.flight === item.flight) return;
                  const li = liRefs.current.get(item.flight);
                  const wrapper = wrapperRef.current;
                  if (li && wrapper) setOverlay(computeOverlay(li, wrapper, item, idx));
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={touchOn}
                  onClick={(e) => handleClick(e.currentTarget)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(e.currentTarget); }
                  }}
                  className="flex h-full cursor-pointer flex-col overflow-hidden bg-grey-00"
                  style={{
                    border: "1px solid #d6d6d2",
                    cursor: hasAction ? "pointer" : "default",
                  }}
                >
                  <Thumb
                    item={item} kbIdx={idx} reduced={reduced}
                    onVideoRef={(el) => {
                      if (el) videoRefs.current.set(item.flight, el);
                      else videoRefs.current.delete(item.flight);
                    }}
                  />

                  <div className="flex flex-1 flex-col px-4 py-3.5">
                    {/* meta row */}
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", color: "#3d6bc4" }}>
                        {item.date}
                      </span>
                      <span className="flex-1" />
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", color: "#d97a2a" }}>
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
                          style={{ width: "18px", height: "18px", border: "1px solid #d6d6d2", color: "#6e6e69", fontSize: "13px", lineHeight: 1, flexShrink: 0, background: "transparent" }}
                        >
                          {externalOnly ? "↗" : "+"}
                        </button>
                      )}
                    </div>

                    {/* name */}
                    <p className="mt-1.5" style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "14px", color: "#232322" }}>
                      {item.name}
                      {externalOnly && <span style={{ fontSize: "11px", color: "#6e6e69", marginLeft: "4px" }} aria-hidden> ↗</span>}
                    </p>
                    <p className="mt-0.5" style={{ fontSize: "14px", color: "#6e6e69" }}>
                      {item.descriptor}
                    </p>

                    {/* Touch: expanded content (no grid reflow, card just grows taller) */}
                    <AnimatePresence initial={false}>
                      {touchOn && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={reduced ? { duration: 0 } : { duration: 0.2 }}
                          className="mt-2 flex flex-col"
                          style={{ gap: "8px" }}
                        >
                          {item.blurb && (
                            <p style={{ fontSize: "14px", color: "#6e6e69", lineHeight: 1.55 }}>{item.blurb}</p>
                          )}
                          {item.meta && (
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#6e6e69", letterSpacing: "0.02em" }}>{item.meta}</p>
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
              </li>
            );
          })}
        </ul>

        {/* Desktop overlay — grows to 2×2 ABOVE neighbours, grid never reflows */}
        <AnimatePresence>
          {!isTouch && overlay && (
            <OverlayCard
              key={overlay.flight}
              spec={overlay}
              reduced={reduced}
              onOpen={(el) => openViewer(overlay.item, el)}
              onExternal={openExternal}
              onMouseEnter={cancelLeave}
              onMouseLeave={scheduleClose}
            />
          )}
        </AnimatePresence>
      </div>

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
