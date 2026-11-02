"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EmbedEntry, Layover } from "@/lib/site";
import { createPortal } from "react-dom";

function figmaEmbedUrl(url: string) {
  return `https://www.figma.com/embed?embed_host=shreyashanmugam&url=${encodeURIComponent(url)}`;
}

function EmbedPane({ entry, onOriginal }: { entry: EmbedEntry; onOriginal: () => void }) {
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimedOut(false);
    if (entry.kind === "site") {
      timerRef.current = setTimeout(() => setTimedOut(true), 4000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [entry.url, entry.kind]);

  if (entry.kind === "video") {
    return (
      <video
        key={entry.url}
        src={entry.url}
        controls
        autoPlay
        muted
        playsInline
        className="size-full object-contain"
        style={{ background: "#131c33" }}
      />
    );
  }

  if (entry.kind === "image") {
    return (
      <img
        src={entry.url}
        alt=""
        className="size-full object-contain"
        style={{ background: "#131c33" }}
      />
    );
  }

  if (timedOut) {
    return (
      <div
        className="flex size-full flex-col items-center justify-center gap-4"
        style={{ background: "#131c33", color: "#a8a8a3" }}
      >
        <p className="text-sm">This site can&apos;t be shown here.</p>
        <button
          onClick={onOriginal}
          className="flex items-center gap-1 border px-4 py-2 text-sm"
          style={{ border: "1px solid #a8a8a3", color: "#3d6bc4" }}
        >
          open original <span aria-hidden>↗</span>
        </button>
      </div>
    );
  }

  const src = entry.kind === "figma" ? figmaEmbedUrl(entry.url) : entry.url;

  return (
    <iframe
      key={entry.url}
      src={src}
      title="embed"
      allowFullScreen
      onLoad={() => {
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      className="size-full border-0"
    />
  );
}

type ViewerProps = {
  item: Layover;
  originRect: DOMRect;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

export default function Viewer({ item, originRect, onClose, triggerRef }: ViewerProps) {
  const [tabIdx, setTabIdx] = useState(0);
  const tabs = item.embed ?? [];
  const current = tabs[tabIdx];

  const closeRef = useRef<HTMLButtonElement>(null);

  /* lock body scroll */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* focus close button on open */
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  /* Esc to close */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, triggerRef]);

  /* origin offset for scale animation */
  const vpCx = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const vpCy = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
  const cardCx = originRect.x + originRect.width / 2;
  const cardCy = originRect.y + originRect.height / 2;
  const offsetX = cardCx - vpCx;
  const offsetY = cardCy - vpCy;

  const openOriginal = () => {
    if (current) window.open(current.url, "_blank", "noreferrer");
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* scrim */}
        <motion.div
          className="absolute inset-0"
          style={{ background: "rgba(19,28,51,0.55)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          onClick={() => {
            onClose();
            triggerRef.current?.focus();
          }}
          aria-hidden
        />

        {/* window */}
        <motion.div
          className="relative flex flex-col overflow-hidden"
          style={{
            width: "min(960px, calc(100vw - 16px))",
            maxHeight: "calc(100vh - 32px)",
            boxShadow: "0 12px 32px rgba(19,28,51,0.14)",
            background: "#fcfcfb",
          }}
          initial={{ opacity: 0, scale: 0.15, x: offsetX, y: offsetY }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, x: offsetX * 0.4, y: offsetY * 0.4 }}
          transition={{
            duration: 0.48,
            ease: [0.22, 1, 0.36, 1],
          }}
          role="dialog"
          aria-modal
          aria-label={item.name}
        >
          {/* top bar */}
          <div
            className="flex shrink-0 items-center gap-3 border-b px-4"
            style={{ height: "44px", borderColor: "#d6d6d2" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 500,
                color: "#a8a8a3",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {item.flight}
            </span>

            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 500,
                color: "#232322",
              }}
            >
              {item.name}
            </span>

            {/* tabs (only when multiple embeds) */}
            {tabs.length > 1 && (
              <div className="flex gap-1">
                {tabs.map((t, i) => (
                  <button
                    key={t.label}
                    onClick={() => setTabIdx(i)}
                    className="px-3 py-1 text-xs"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 500,
                      color: i === tabIdx ? "#3d6bc4" : "#a8a8a3",
                      borderBottom: i === tabIdx ? "2px solid #3d6bc4" : "2px solid transparent",
                      transition: "color 0.2s, border-color 0.2s",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <span className="flex-1" />

            {/* open original */}
            {current && (
              <button
                onClick={openOriginal}
                className="flex items-center gap-1 text-xs"
                style={{ color: "#3d6bc4", fontFamily: "var(--font-mono)" }}
              >
                open original <span aria-hidden>↗</span>
              </button>
            )}

            {/* close */}
            <button
              ref={closeRef}
              onClick={() => {
                onClose();
                triggerRef.current?.focus();
              }}
              className="flex size-8 items-center justify-center border text-sm"
              style={{ border: "1px solid #d6d6d2", color: "#232322" }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* content area: 16:10 */}
          <div
            className="relative w-full"
            style={{ paddingBottom: "62.5%" /* 10/16 */ }}
          >
            <div className="absolute inset-0">
              {current && (
                <EmbedPane
                  key={`${item.flight}-${tabIdx}`}
                  entry={current}
                  onOriginal={openOriginal}
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
