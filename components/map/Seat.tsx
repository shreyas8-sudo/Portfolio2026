"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Place } from "@/lib/site";
import Window from "@/components/Window";

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
  shotDir,
  inT,
  outT,
  slowT,
}: SeatProps) {
  return (
    <div className="w-full">
      <Window>
        {/* Empty prompt */}
        <AnimatePresence>
          {!selected && (
            <motion.div
              key="empty"
              className="absolute inset-0 z-20 grid place-items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: inT }}
              exit={{ opacity: 0, transition: outT }}
            >
              <span
                className={`label ${still ? "text-white/90" : "text-grey-60"} ${compact ? "text-center text-[9px] leading-tight" : ""}`}
              >
                {compact ? "Tap a pin" : "Click on any pin!"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photos */}
        <AnimatePresence mode="popLayout">
          {selected && (
            <motion.div
              key={`${selected.name}-${shot}`}
              className="absolute inset-0 overflow-hidden"
              initial={{
                opacity: 0,
                scale: still ? 1 : 1.12,
                filter: still ? "blur(0px)" : "blur(6px)",
                x: still ? "0%" : `${shotDir * 4}%`,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                x: "0%",
                transition: slowT,
              }}
              exit={{
                opacity: 0,
                x: still ? "0%" : `${-shotDir * 4}%`,
                transition: outT,
              }}
            >
              <motion.div
                className="absolute top-0 h-full"
                style={{ width: "108%", left: "-4%" }}
                animate={still ? {} : { x: ["0%", "-3%"] }}
                transition={{
                  duration: 12,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              >
                <PlacePhoto
                  src={shots[shot] ?? shots[0]}
                  alt={selected.name}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Window shade */}
        {!still && (
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ backgroundColor: "#e9e6df" }}
            initial={{ y: "0%" }}
            animate={{ y: selected ? "-100%" : "0%" }}
            transition={selected ? slowT : inT}
          />
        )}
      </Window>

      {/* Multi-shot thumbnails */}
      {selected && shots.length > 1 && (
        <div
          className={`flex justify-center ${compact ? "mt-1.5 gap-1" : "mt-3 gap-1.5"}`}
        >
          {shots.map((src, i) => (
            <button
              key={src}
              onClick={() => onShot(i)}
              aria-label={`Photo ${i + 1}`}
              className={`overflow-hidden border transition-opacity ${
                compact ? "size-5" : "size-10"
              } ${
                i === shot
                  ? "border-[#fcfcfb] opacity-100"
                  : "border-white/10 opacity-50 hover:opacity-80"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Place info */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, y: still ? 0 : 8 }}
            animate={{ opacity: 1, y: 0, transition: inT }}
            exit={{ opacity: 0, transition: outT }}
          >
            <p
              className={`flex flex-wrap items-center justify-center gap-2 text-center font-semibold text-white ${
                compact ? "mt-2 text-[13px] leading-tight" : "mt-4 text-sub"
              }`}
            >
              {selected.name}
              {selected.home && !compact && (
                <span
                  className="label px-1.5 py-0.5"
                  style={{
                    color: "var(--color-orange)",
                    border: "1px solid var(--color-orange)",
                  }}
                >
                  lived here
                </span>
              )}
            </p>
            <p
              className="label mt-1 text-center"
              style={{ color: "var(--color-marigold)" }}
            >
              {compact ? (
                selected.date
              ) : (
                <>
                  {selected.date} · {Math.abs(selected.lat).toFixed(1)}°
                  {selected.lat >= 0 ? "N" : "S"}{" "}
                  {Math.abs(selected.lon).toFixed(1)}°
                  {selected.lon >= 0 ? "E" : "W"}
                </>
              )}
            </p>
            {selected.caption && !compact && (
              <p className="mt-2 text-center text-caption text-white/60">
                {selected.caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
