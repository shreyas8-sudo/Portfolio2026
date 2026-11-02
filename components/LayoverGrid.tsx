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
          const isOn = expanded === item.flight;
          const isHov = !isTouch && hovered === item.flight;
          const playing = (isHov || isOn) && !!item.video;
          const isExternal = !!item.external;

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
              onMouseEnter={() => setHovered(item.flight)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isOn}
                onClick={(e) => toggle(item.flight, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(item.flight, e.currentTarget);
                  }
                }}
                className="flex h-full cursor-pointer flex-col overflow-hidden bg-grey-00"
                style={{
                  border: `1px solid ${isHov || isOn ? "#a8a8a3" : "#d6d6d2"}`,
                  boxShadow: isHov || isOn ? "0 2px 8px rgba(19,28,51,0.05)" : "none",
                  transform: isHov ? "translateY(-3px)" : "translateY(0)",
                  transition: `border-color var(--dur-base) var(--ease-move), box-shadow var(--dur-base) var(--ease-move), transform var(--dur-base) var(--ease-move)`,
                }}
              >
                <Thumb item={item} playing={playing} isTouch={isTouch} />

                <div className="flex flex-1 flex-col px-4 py-3.5">
                  {/* date + origin */}
                  <div className="flex items-center justify-between gap-2">
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

                        <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
                          {item.embed && (
                            <button
                              onClick={(e) => openViewer(item, e.currentTarget)}
                              className="px-4 py-2 text-sm"
                              style={{
                                border: "1px solid #d6d6d2",
                                color: "#3d6bc4",
                                fontFamily: "var(--font-sans)",
                                fontWeight: 500,
                                background: "transparent",
                              }}
                            >
                              open
                            </button>
                          )}
                          {item.external && (
                            <a
                              href={item.external}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-4 py-2 text-sm"
                              style={{
                                border: "1px solid #d6d6d2",
                                color: "#3d6bc4",
                                fontFamily: "var(--font-sans)",
                                fontWeight: 500,
                              }}
                            >
                              visit <span aria-hidden>↗</span>
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>

      {/* viewer overlay */}
      <AnimatePresence>
        {viewer && (
          <Viewer
            key={viewer.item.flight}
            item={viewer.item}
            originRect={viewer.rect}
            onClose={() => setViewer(null)}
            triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
          />
        )}
      </AnimatePresence>
    </>
  );
}
