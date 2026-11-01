"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { dur, ease } from "@/lib/motion";
import Pass from "./Pass";

const PASSES = [
  { name: "designathon",    descriptor: "runner-up, Framer track at CreateSC", flight: "DA118", color: "#e0b33c", darkText: true  },
  { name: "spotify widgets",descriptor: "24-hour design challenge",             flight: "SP024", color: "#d97a2a", darkText: false },
  { name: "peinao",         descriptor: "allergen menu analyser",               flight: "PN101", color: "#1e2d50", darkText: false },
  { name: "mark",           descriptor: "learn choreography from video",        flight: "MK001", color: "#3d6bc4", darkText: false },
] as const;

const INSET     = 20;
const CLOSED_GAP = 14;
const OPEN_GAP   = 72;
const OPEN_EXTRA = 40;   // height for "+ 7 MORE STOPS" row + bottom inset

export default function WalletTile() {
  const [open, setOpen]       = useState(false);
  const [canHover, setCanHover] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const [closedH, setClosedH] = useState(263);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!coverRef.current) return;
    const measure = () => {
      const w = coverRef.current!.offsetWidth;
      if (w) setClosedH(Math.round(w * 9 / 16));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(coverRef.current);
    return () => ro.disconnect();
  }, []);

  const isOpen = canHover && open;

  const openH =
    INSET +
    (PASSES.length - 1) * OPEN_GAP +
    72 +           // front pass header
    OPEN_EXTRA;

  const shell =
    "group flex flex-col overflow-hidden border border-grey-20 bg-grey-00 transition-[border-color] duration-[--dur-base] ease-[--ease-move] hover:border-grey-40";

  const content = (
    <>
      {/* cover -- stacked passes */}
      <motion.div
        ref={coverRef}
        className="relative overflow-hidden bg-grey-05"
        animate={{ height: isOpen ? openH : closedH }}
        initial={false}
        transition={{ duration: dur.base, ease: ease.move }}
      >
        {PASSES.map((pass, i) => {
          const isFront = i === PASSES.length - 1;
          const yTarget = INSET + i * (isOpen ? OPEN_GAP : CLOSED_GAP);
          const delay   = isOpen ? (PASSES.length - 1 - i) * 0.04 : 0;

          return (
            <motion.div
              key={pass.name}
              className="absolute left-5 right-5"
              animate={{ top: yTarget }}
              initial={false}
              transition={{ duration: dur.base, ease: ease.move, delay }}
              style={{ zIndex: i + 1 }}
            >
              <Pass
                name={pass.name}
                descriptor={pass.descriptor}
                flight={pass.flight}
                color={pass.color}
                darkText={pass.darkText}
                showMedia={!isOpen && isFront}
              />
            </motion.div>
          );
        })}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="more-stops"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: dur.quick, ease: ease.fade, delay: 0.16 }}
              className="absolute left-5 right-5 border border-dashed border-grey-20"
              style={{ top: INSET + PASSES.length * OPEN_GAP }}
            >
              <p className="label py-3 text-center text-grey-40">
                + 7 MORE STOPS
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* info */}
      <div className="flex flex-1 flex-col px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="label" style={{ color: "var(--color-blue)" }}>LAYOVERS</p>
          <p className="label text-grey-40">11 STOPS</p>
        </div>
        <p className="mt-2 text-[20px] font-semibold leading-snug tracking-tight text-grey-90 sm:text-[22px]">
          Side projects, experiments and challenges, between destinations
          {" "}
          <span style={{ color: "var(--color-blue)" }}>→</span>
        </p>
      </div>
    </>
  );

  if (!canHover) {
    return (
      <Link href="/layovers" className={shell}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className={shell}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {content}
    </div>
  );
}
