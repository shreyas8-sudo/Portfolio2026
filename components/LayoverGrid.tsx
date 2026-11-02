"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Layover } from "@/lib/site";
import Viewer from "./Viewer";

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

function Thumb({
  item,
  playing,
  isTouch,
}: {
  item: Layover;
  playing: boolean;
  isTouch: boolean;
}) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    if (playing && !isTouch) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [playing, isTouch]);

  const scaleStyle = {
    transform: playing && !isTouch ? "scale(1.02)" : "scale(1)",
    transition: `transform var(--dur-base) var(--ease-move)`,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  };

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-grey-05">
      {item.video ? (
        <video
          ref={vidRef}
          src={item.video}
          poster={item.thumb}
          muted
          loop
          playsInline
          preload="metadata"
          style={scaleStyle}
        />
      ) : !imgErr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumb}
          alt={item.name}
          onError={() => setImgErr(true)}
          style={scaleStyle}
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

type ViewerState = {
  item: Layover;
  rect: DOMRect;
};

export default function LayoverGrid({ items }: { items: Layover[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const isTouch = useIsTouch();

  const liRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const triggerRef = useRef<HTMLElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (flight: string, el: HTMLElement) => {
    setExpanded((prev) => {
      if (prev === flight) return null;
      triggerRef.current = el;
      return flight;
    });
  };

  const openViewer = (item: Layover, triggerEl: HTMLElement) => {
    const li = liRefs.current.get(item.flight);
    const rect = li?.getBoundingClientRect() ?? triggerEl.getBoundingClientRect();
    triggerRef.current = triggerEl;
    setViewer({ item, rect });
  };

  return (
    <>
      <ul
        className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        style={{ gridAutoFlow: "dense" }}
      >
        {items.map((item) => {
          // Desktop: expand on hover. Touch: expand on tap.
          const isOn = (!isTouch && hovered === item.flight) || (isTouch && expanded === item.flight);
          const playing = isOn && !!item.video;
          const isExternal = !!item.external;

          const handleCardClick = (el: HTMLElement) => {
            if (isTouch) {
              toggle(item.flight, el);
              return;
            }
            // Desktop: click opens content directly
            if (item.embed) {
              openViewer(item, el);
            } else if (item.external) {
              window.open(item.external, "_blank", "noreferrer");
            } else {
              // blurb-only card — nothing to open, just show on hover
            }
          };

          return (
            <motion.li
              key={item.flight}
              layout
              transition={{ duration: 0.28, ease: EASING }}
              ref={(el) => {
                if (el) liRefs.current.set(item.flight, el);
                else liRefs.current.delete(item.flight);
              }}
              className={isOn ? "sm:col-span-2 sm:row-span-2" : ""}
              onMouseEnter={() => {
                if (isTouch) return;
                if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
                setHovered(item.flight);
              }}
              onMouseLeave={() => {
                if (isTouch) return;
                leaveTimer.current = setTimeout(() => { setHovered(null); leaveTimer.current = null; }, 80);
              }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isOn}
                onClick={(e) => handleCardClick(e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(e.currentTarget);
                  }
                }}
                className="flex h-full cursor-pointer flex-col overflow-hidden bg-grey-00"
                style={{
                  border: `1px solid ${isOn ? "#a8a8a3" : "#d6d6d2"}`,
                  boxShadow: isOn ? "0 2px 8px rgba(19,28,51,0.05)" : "none",
                  transform: "translateY(0)",
                  cursor: !isTouch && (item.embed || item.external) ? "pointer" : "default",
                  transition: `border-color var(--dur-base) var(--ease-move), box-shadow var(--dur-base) var(--ease-move), transform var(--dur-base) var(--ease-move)`,
                }}
              >
                <Thumb item={item} playing={playing} isTouch={isTouch} />

                <div className="flex flex-1 flex-col px-4 py-3.5">
                  {/* date + origin + toggle icon */}
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 500,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#3d6bc4",
                      }}
                    >
                      {item.date}
                    </span>
                    <span className="flex-1" />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 500,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#d97a2a",
                      }}
                    >
                      {item.origin}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const card = e.currentTarget.closest('[role="button"]') as HTMLElement | null;
                        if (isTouch) {
                          toggle(item.flight, card ?? e.currentTarget);
                        } else if (item.embed) {
                          openViewer(item, card ?? e.currentTarget);
                        } else if (item.external) {
                          window.open(item.external, "_blank", "noreferrer");
                        }
                      }}
                      aria-label={isOn ? "Collapse" : "Expand"}
                      className="grid place-items-center"
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "1px solid #d6d6d2",
                        color: "#6e6e69",
                        fontSize: "14px",
                        lineHeight: 1,
                        flexShrink: 0,
                        background: "transparent",
                        transition: `color var(--dur-base) var(--ease-move), border-color var(--dur-base) var(--ease-move)`,
                      }}
                    >
                      {isOn ? "×" : "+"}
                    </button>
                  </div>

                  {/* name */}
                  <p
                    className="mt-1.5 flex items-baseline gap-1"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      fontSize: isOn ? "22px" : "14px",
                      color: "#232322",
                      transition: `font-size var(--dur-base) var(--ease-move)`,
                    }}
                  >
                    {item.name}
                    {isExternal && (
                      <span style={{ fontSize: "12px", color: "#6e6e69" }} aria-hidden>
                        ↗
                      </span>
                    )}
                  </p>

                  {/* descriptor (collapsed only) */}
                  {!isOn && (
                    <p
                      className="mt-0.5"
                      style={{ fontSize: "14px", color: "#6e6e69" }}
                    >
                      {item.descriptor}
                    </p>
                  )}

                  {/* expanded content */}
                  <AnimatePresence initial={false}>
                    {isOn && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2"
                      >
                        {item.blurb && (
                          <p style={{ fontSize: "14px", color: "#6e6e69", lineHeight: 1.55 }}>
                            {item.blurb}
                          </p>
                        )}

                        {/* touch-only action icons — desktop opens via card click */}
                        {isTouch && (
                          <div className="mt-4 flex gap-2">
                            {item.embed && (
                              <button
                                onClick={(e) => { e.stopPropagation(); openViewer(item, e.currentTarget); }}
                                aria-label="Open in viewer"
                                className="grid place-items-center"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  border: "1px solid #d6d6d2",
                                  color: "#3d6bc4",
                                  fontSize: "16px",
                                  background: "transparent",
                                }}
                              >
                                +
                              </button>
                            )}
                            {item.external && (
                              <a
                                href={item.external}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Visit"
                                className="grid place-items-center"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  border: "1px solid #d6d6d2",
                                  color: "#3d6bc4",
                                  fontSize: "13px",
                                }}
                              >
                                ↗
                              </a>
                            )}
                          </div>
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

      {/* viewer overlay -- always mounted, animated by open prop */}
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
