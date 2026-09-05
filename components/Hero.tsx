"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { site, credentials, waypoints, type Waypoint } from "@/lib/site";
import Plane from "./Plane";

/* pin colours, brighter, and marigold swapped for orange so the
   numbers inside stay legible against white */
const COLOR: Record<Waypoint["color"], string> = {
  sky: "#3d8fe0",
  marigold: "var(--color-orange)",
  blue: "var(--color-blue)",
};

/* dots sit wide apart, framing the centred name */
const ANCHOR: Record<Waypoint["position"], { x: number; y: number }> = {
  left: { x: 6, y: 42 },
  bottom: { x: 50, y: 88 },
  right: { x: 94, y: 26 },
};

/* plane rests tucked just above the name */
const REST = { x: 50, y: 27 };

export default function Hero() {
  const [active, setActive] = useState<string | null>(null);
  const current = waypoints.find((w) => w.id === active) ?? null;
  const planeAt = current ? ANCHOR[current.position] : REST;

  return (
    <section className="hero-sky relative w-full overflow-hidden">
      {/* exactly one viewport, minus the nav, text lands centred with no scroll */}
      <div className="relative mx-auto h-[calc(100svh-4.5rem)] max-w-[84rem] px-6 md:px-10">
        {/* plane */}
        <motion.div
          className="pointer-events-none absolute z-10"
          initial={false}
          animate={{ left: `${planeAt.x}%`, top: `${planeAt.y}%` }}
          transition={{ type: "spring", stiffness: 48, damping: 17, mass: 1 }}
          style={{ translate: "-50% -50%" }}
        >
          <Plane width={132} climb={-18} />
        </motion.div>

        {/* centred name block */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center text-center">
          <h1 className="text-[clamp(2.25rem,5.2vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-grey-90">
            {site.name}.
          </h1>

          {/* the tagline carries the hero now. sized off the viewport so it always
              holds one line, never breaking mid-thought */}
          <p className="mt-5 whitespace-nowrap text-[clamp(0.9rem,3.15vw,1.6rem)] font-medium leading-[1.3] tracking-[-0.015em] text-grey-60">
            Designing to make complex systems feel{" "}
            <span style={{ color: "var(--color-blue)" }}>simple</span>.
          </p>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {credentials.map((c) => (
              <li key={c.n} className="flex items-center gap-2">
                <span
                  className="label"
                  style={{ color: `var(--color-${c.color})` }}
                >
                  [{c.n}]
                </span>
                <span className="text-caption text-grey-60">{c.text}</span>
              </li>
            ))}
          </ul>

        </div>

        {/* nudge toward the dots, bottom left */}
        <p
          className={`absolute bottom-8 left-0 z-30 text-caption italic text-grey-40 transition-opacity duration-500 ${
            active ? "opacity-0" : "opacity-100"
          }`}
        >
          psst, click the dots
        </p>

        {/* waypoint dots, numbered */}
        {waypoints.map((w, i) => {
          const pos = ANCHOR[w.position];
          const isActive = active === w.id;
          return (
            <button
              key={w.id}
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
            </button>
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
              className="absolute z-30 whitespace-nowrap text-caption text-grey-60"
              style={{
                left: `${ANCHOR[current.position].x}%`,
                top: `calc(${ANCHOR[current.position].y}% + 22px)`,
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
