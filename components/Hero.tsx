"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { site, waypoints, type Waypoint } from "@/lib/site";
import Plane from "./Plane";
import Settle from "./Settle";

/* pin colours, brighter, and marigold swapped for orange so the
   numbers inside stay legible against white */
const COLOR: Record<Waypoint["color"], string> = {
  sky: "#3d8fe0",
  marigold: "var(--color-orange)",
  blue: "var(--color-blue)",
};

/* Dots sit wide apart, framing the centred name.
   On a phone there is no width to frame anything with, so they move out of
   the text band entirely (roughly 38% to 64%) and sit above and below it. */
const ANCHOR: Record<Waypoint["position"], { x: number; y: number }> = {
  left: { x: 10, y: 42 },
  bottom: { x: 50, y: 86 },
  right: { x: 90, y: 26 },
};

const ANCHOR_SM: Record<Waypoint["position"], { x: number; y: number }> = {
  left: { x: 50, y: 24 },
  bottom: { x: 28, y: 80 },
  right: { x: 76, y: 73 },
};

/* plane rests tucked just above the name */
const REST = { x: 50, y: 27 };
const REST_SM = { x: 50, y: 9 };

export default function Hero() {
  const [active, setActive] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const anchors = narrow ? ANCHOR_SM : ANCHOR;
  const current = waypoints.find((w) => w.id === active) ?? null;
  const planeAt = current ? anchors[current.position] : narrow ? REST_SM : REST;

  return (
    <section className="hero-sky relative w-full overflow-hidden">
      {/* exactly one viewport, minus the nav, text lands centred with no scroll */}
      <div className="relative mx-auto h-[calc(100svh-4.5rem)] max-w-[84rem] px-6 md:px-10">
        {/* plane */}
        <motion.div
          className="pointer-events-none absolute z-10"
          initial={{ left: "-12%", top: `${planeAt.y}%`, opacity: 0 }}
          animate={{ left: `${planeAt.x}%`, top: `${planeAt.y}%`, opacity: 1 }}
          transition={{ type: "spring", stiffness: 48, damping: 17, mass: 1 }}
          style={{ translate: "-50% -50%" }}
        >
          <Plane width={narrow ? 88 : 132} climb={-18} />
        </motion.div>

        {/* centred name block */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center text-center">
          <Settle delay={0.05}>
            <h1 className="text-[clamp(2.25rem,5.2vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-grey-90">
              {site.name}.
            </h1>
          </Settle>

          {/* the tagline carries the hero now. sized off the viewport so it always
              holds one line, never breaking mid-thought */}
          <Settle delay={0.16} distance={14}>
            <p className="mt-5 max-w-[22ch] text-balance text-[clamp(1.15rem,3.15vw,1.6rem)] font-medium leading-[1.3] tracking-[-0.015em] text-grey-60 sm:max-w-none sm:whitespace-nowrap">
              Designing to make complex systems feel{" "}
              <span style={{ color: "var(--color-blue)" }}>simple</span>.
            </p>
          </Settle>
        </div>

        {/* nudge toward the dots, bottom left */}
        <p
          className={`absolute bottom-8 left-6 z-30 text-caption italic text-grey-40 transition-opacity duration-500 md:left-10 ${
            active ? "opacity-0" : "opacity-100"
          }`}
        >
          psst, click the dots
        </p>

        {/* waypoint dots, numbered */}
        {waypoints.map((w, i) => {
          const pos = anchors[w.position];
          const isActive = active === w.id;
          return (
            <motion.button
              key={w.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 22,
                delay: 0.42 + i * 0.09,
              }}
              onClick={() => setActive(isActive ? null : w.id)}
              aria-pressed={isActive}
              aria-label={w.label}
              className="group absolute z-30 grid size-11 place-items-center"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                translate: "-50% -50%",
              }}
            >
              {/* number sits inside the dot */}
              <span
                className="z-10 grid place-items-center rounded-full font-mono text-[12px] font-semibold leading-none text-white transition-all duration-300"
                style={{
                  width: isActive ? 26 : 23,
                  height: isActive ? 26 : 23,
                  background: COLOR[w.color],
                  opacity: 1,
                }}
              >
                {i + 1}
              </span>
              <span
                className="absolute rounded-full border transition-all duration-500 group-hover:scale-110"
                style={{
                  width: isActive ? 38 : 30,
                  height: isActive ? 38 : 30,
                  borderColor: COLOR[w.color],
                  opacity: isActive ? 0.5 : 0.25,
                }}
              />
            </motion.button>
          );
        })}

        {/* one small label at a time */}
        <AnimatePresence mode="wait">
          {current && (
            <motion.p
              key={current.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              /* chip, not bare text: the sky washes drift underneath it and a
                 grey caption on a moving gradient is a coin toss to read */
              className="absolute z-30 max-w-[12rem] rounded-[--radius-tag] bg-grey-00/80 px-2.5 py-1 text-center text-caption text-grey-90 shadow-[0_1px_6px_rgba(19,28,51,0.07)] backdrop-blur-sm sm:max-w-none sm:whitespace-nowrap"
              style={{
                left: `${anchors[current.position].x}%`,
                top: `calc(${anchors[current.position].y}% + 22px)`,
                translate: "-50% 0",
              }}
            >
              {current.label}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* perforation closing the hero */}
      <div className="perforation w-full" aria-hidden="true" />
    </section>
  );
}
