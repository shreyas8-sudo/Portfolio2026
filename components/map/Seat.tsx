"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Place } from "@/lib/site";
import Window from "@/components/Window";

const photosOf = (p: Place) => (Array.isArray(p.photo) ? p.photo : [p.photo]);

function PlacePhoto({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="grid size-full place-items-center">
        <span className="label text-white/70">photo coming soon</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="size-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

type ShadePhase = "closed" | "opening" | "open" | "closing";

/* seconds */
const RISE      = 1.4;
const SETTLE    = 1.6;
const LOWER_SW  = 0.9;  // switch pin/shot
const LOWER_DE  = 1.2;  // deselect

const EASE_CAM: [number, number, number, number]   = [0.65, 0, 0.35, 1];
const EASE_FADE: [number, number, number, number]  = [0.4, 0, 0.2, 1];
const EASE_MOVE: [number, number, number, number]  = [0.22, 1, 0.36, 1];

type TransitionSpec = { duration: number; ease: number[] };

interface SeatProps {
  selected: Place | null;
  shot: number;
  shots: string[];
  compact?: boolean;
  onShot: (i: number) => void;
  still: boolean | null;
  shotDir: number;
  inT: TransitionSpec;
  outT: TransitionSpec;
  slowT: TransitionSpec;
}

export const Seat = memo(function Seat({
  selected,
  shot,
  shots,
  compact = false,
  onShot,
  still,
  inT,
  outT,
}: SeatProps) {
  /* ── reduced-motion path: simple 300ms crossfade ─────────────────── */
  if (still) {
    const rm = { duration: 0.3, ease: EASE_FADE };
    return (
      <div className="w-full">
        <Window>
          <AnimatePresence>
            {!selected && (
              <motion.div
                key="empty"
                className="absolute inset-0 z-20 grid place-items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: rm }}
                exit={{ opacity: 0, transition: rm }}
              >
                <span className={`label text-white/90 ${compact ? "text-center text-[9px] leading-tight" : ""}`}>
                  {compact ? "Tap a pin" : "Click on any pin!"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {selected && (
              <motion.div
                key={`${selected.name}-${shot}`}
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: rm }}
                exit={{ opacity: 0, transition: rm }}
              >
                <PlacePhoto src={shots[shot] ?? shots[0]} alt={selected.name} />
              </motion.div>
            )}
          </AnimatePresence>
        </Window>
        {selected && shots.length > 1 && (
          <div className={`flex justify-center ${compact ? "mt-1.5 gap-1" : "mt-3 gap-1.5"}`}>
            {shots.map((src, i) => (
              <button
                key={src}
                onClick={() => onShot(i)}
                aria-label={`Photo ${i + 1}`}
                className={`overflow-hidden border transition-opacity ${compact ? "size-5" : "size-10"} ${i === shot ? "border-[#fcfcfb] opacity-100" : "border-white/10 opacity-50 hover:opacity-80"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
              </button>
            ))}
          </div>
        )}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: rm }}
              exit={{ opacity: 0, transition: rm }}
            >
              <PlaceInfo selected={selected} compact={compact} inT={inT} outT={outT} still={still} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ── full shade state machine (memoised inner component) ──────────── */
  return <SeatFull selected={selected} shot={shot} shots={shots} compact={compact} onShot={onShot} inT={inT} outT={outT} />;
});

/* ── place info (shared between both paths) ───────────────────────── */
function PlaceInfo({
  selected,
  compact,
  inT,
  outT,
  still,
}: {
  selected: Place;
  compact: boolean;
  inT: TransitionSpec;
  outT: TransitionSpec;
  still: boolean | null;
}) {
  return (
    <>
      <p className={`flex flex-wrap items-center justify-center gap-2 text-center font-semibold text-white ${compact ? "mt-2 text-[13px] leading-tight" : "mt-4 text-sub"}`}>
        {selected.name}
        {selected.home && !compact && (
          <span className="label px-1.5 py-0.5" style={{ color: "var(--color-orange)", border: "1px solid var(--color-orange)" }}>
            lived here
          </span>
        )}
      </p>
      <p className="label mt-1 text-center" style={{ color: "var(--color-marigold)" }}>
        {compact ? selected.date : (
          <>{selected.date} · {Math.abs(selected.lat).toFixed(1)}°{selected.lat >= 0 ? "N" : "S"} {Math.abs(selected.lon).toFixed(1)}°{selected.lon >= 0 ? "E" : "W"}</>
        )}
      </p>
      {selected.caption && !compact && (
        <p className="mt-2 text-center text-caption text-white/60">{selected.caption}</p>
      )}
    </>
  );
}

/* ── full-animation seat (state machine lives here) ──────────────── */
const SeatFull = memo(function SeatFull({
  selected,
  shot,
  shots,
  compact,
  onShot,
  inT,
  outT,
}: Omit<SeatProps, "still" | "shotDir" | "slowT">) {
  const [phase, setPhaseState] = useState<ShadePhase>("closed");
  const phaseRef = useRef<ShadePhase>("closed");
  const setPhase = useCallback((p: ShadePhase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  /* what's currently visible behind the shade */
  const [visible, setVisible] = useState<{ place: Place; shot: number } | null>(null);

  /* latest queued request while a transition is running */
  const queueRef = useRef<{ place: Place; shot: number } | "deselect" | null>(null);

  /* timer */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);
  useEffect(() => () => clearTimer(), [clearTimer]);

  /* duration to use when shade lowers — set before each "closing" transition */
  const closeDurRef = useRef(LOWER_SW);

  /* photo key — increment to force re-mount (and therefore re-settle) */
  const photoKeyRef = useRef(0);

  /* process the queue after a close finishes */
  const processQueue = useCallback(() => {
    const q = queueRef.current;
    queueRef.current = null;
    if (!q || q === "deselect") {
      setVisible(null);
      setPhase("closed");
    } else {
      photoKeyRef.current += 1;
      setVisible(q);
      setPhase("opening");
      timerRef.current = setTimeout(() => setPhase("open"), RISE * 1000);
    }
  }, [setPhase]);

  /* drive the state machine whenever selected/shot changes */
  useEffect(() => {
    const req = selected ? { place: selected, shot } : null;

    switch (phaseRef.current) {
      case "closed":
        if (!req) return;
        photoKeyRef.current += 1;
        setVisible(req);
        setPhase("opening");
        clearTimer();
        timerRef.current = setTimeout(() => setPhase("open"), RISE * 1000);
        break;

      case "open":
        if (!req) {
          closeDurRef.current = LOWER_DE;
          setPhase("closing");
          clearTimer();
          timerRef.current = setTimeout(processQueue, LOWER_DE * 1000);
        } else {
          closeDurRef.current = LOWER_SW;
          queueRef.current = req;
          setPhase("closing");
          clearTimer();
          timerRef.current = setTimeout(processQueue, LOWER_SW * 1000);
        }
        break;

      case "opening":
      case "closing":
        /* queue the latest request; discard any earlier queued one */
        queueRef.current = req ?? "deselect";
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, shot]);

  /* shade target position */
  const shadeY    = (phase === "opening" || phase === "open") ? "-100%" : "0%";
  const shadeDur  = phase === "opening" ? RISE : closeDurRef.current;

  /* visible photo src */
  const visibleSrc = visible
    ? (photosOf(visible.place)[visible.shot] ?? photosOf(visible.place)[0])
    : null;

  return (
    <div className="w-full">
      <Window>
        {/* ── empty prompt: shown only while closed ──────────────── */}
        <AnimatePresence>
          {phase === "closed" && !visible && (
            <motion.div
              key="empty"
              className="absolute inset-0 z-20 grid place-items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: inT }}
              exit={{ opacity: 0, transition: outT }}
            >
              <span className={`label text-grey-60 ${compact ? "text-center text-[9px] leading-tight" : ""}`}>
                {compact ? "Tap a pin" : "Click on any pin!"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── photo: rendered whenever visible is set ─────────────── */}
        {visibleSrc && visible && (
          <motion.div
            key={photoKeyRef.current}
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0, scale: 1.12, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: SETTLE, ease: EASE_CAM }}
          >
            {/* drift — only while open */}
            <motion.div
              className="absolute top-0 h-full"
              style={{ width: "108%", left: "-4%" }}
              animate={phase === "open" ? { x: ["0%", "-3%"] } : false}
              transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
            >
              <PlacePhoto src={visibleSrc} alt={visible.place.name} />
            </motion.div>
          </motion.div>
        )}

        {/* ── shade: always present, driven by phase ──────────────── */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ backgroundColor: "#e9e6df" }}
          animate={{ y: shadeY }}
          transition={{ duration: shadeDur, ease: EASE_CAM }}
        />
      </Window>

      {/* ── thumbnails: reflect current selection ───────────────── */}
      {selected && shots.length > 1 && (
        <div className={`flex justify-center ${compact ? "mt-1.5 gap-1" : "mt-3 gap-1.5"}`}>
          {shots.map((src, i) => (
            <button
              key={src}
              onClick={() => onShot(i)}
              aria-label={`Photo ${i + 1}`}
              className={`overflow-hidden border transition-opacity ${compact ? "size-5" : "size-10"} ${i === shot ? "border-[#fcfcfb] opacity-100" : "border-white/10 opacity-50 hover:opacity-80"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
            </button>
          ))}
        </div>
      )}

      {/* ── place info: crossfades on place change ───────────────── */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_MOVE } }}
            exit={{ opacity: 0, transition: { duration: 0.16, ease: EASE_FADE } }}
          >
            <PlaceInfo selected={selected} compact={!!compact} inT={{ duration: 0.28, ease: Array.from(EASE_MOVE) }} outT={{ duration: 0.16, ease: Array.from(EASE_FADE) }} still={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
