"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Layover } from "@/lib/site";
import Arrow from "./Arrow";

/** thumbnail, whole image visible, video plays on hover if one exists */
function Thumb({ item, active }: { item: Layover; active: boolean }) {
  const [noImg, setNoImg] = useState(false);
  const vid = useRef<HTMLVideoElement>(null);

  if (item.video) {
    const v = vid.current;
    if (v) {
      if (active) v.play().catch(() => {});
      else {
        v.pause();
        v.currentTime = 0;
      }
    }
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-grey-05">
      {item.video ? (
        <video
          ref={vid}
          src={item.video}
          poster={item.thumb}
          muted
          loop
          playsInline
          /* see CaseCover: "none" leaves the loop without a duration on the
             first hover, and the clip plays through once and stops */
          preload="metadata"
          onEnded={(e) => {
            if (!active) return;
            e.currentTarget.currentTime = 0;
            e.currentTarget.play().catch(() => {});
          }}
          className="size-full object-cover"
        />
      ) : !noImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumb}
          alt={item.name}
          onError={() => setNoImg(true)}
          className="size-full object-cover object-top transition-transform duration-500"
          style={{ transform: active ? "scale(1.03)" : "scale(1)" }}
        />
      ) : (
        <span className="label absolute inset-0 grid place-items-center text-grey-40">
          {item.name}
        </span>
      )}
    </div>
  );
}

export default function LayoverGrid({ items }: { items: Layover[] }) {
  const [active, setActive] = useState<string | null>(null);
  /**
   * On touch, a card that is also a link means a tap can only ever do one
   * thing, and the blurb never gets read. So the card opens itself, and the
   * link is its own control inside. Hover devices keep the whole card live.
   */
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setTouch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const isOn = active === item.name;
        const href = item.link?.href;

        const Card = (
          <>
            <Thumb item={item} active={isOn} />

            <div className="flex flex-1 flex-col px-4 py-3.5">
              {/* when · category */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className="label"
                  style={{ color: "var(--color-blue)" }}
                >
                  {item.date}
                </span>
                <span
                  className="label"
                  style={{ color: "var(--color-orange)" }}
                >
                  {item.origin}
                </span>
              </div>

              <p className="mt-1.5 text-caption font-medium text-grey-90">
                {item.name}
              </p>

              {/* reveals on hover */}
              <AnimatePresence initial={false}>
                {isOn && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-caption text-grey-60">
                      {item.blurb}
                    </p>
                    {item.link &&
                      (touch ? (
                        /* the only thing on the card that navigates */
                        <a
                          href={item.link.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="arrow-link mt-3 inline-flex rounded-[--radius-tag] border border-grey-20 px-3 py-1.5"
                          style={{ color: "var(--color-blue)" }}
                        >
                          <span>{item.link.label}</span>
                          <Arrow color="var(--color-blue)" />
                        </a>
                      ) : (
                        <span
                          className="arrow-link mt-3"
                          style={{ color: "var(--color-blue)" }}
                        >
                          <span>{item.link.label}</span>
                          <Arrow color="var(--color-blue)" />
                        </span>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        );

        const shell =
          "flex size-full flex-col overflow-hidden rounded-[--radius-card] border bg-grey-00 text-left transition-all duration-300 " +
          (isOn
            ? "border-grey-40 shadow-[0_5px_20px_rgba(0,0,0,0.06)]"
            : "border-grey-20");

        return (
          <li
            key={item.name}
            onMouseEnter={() => setActive(item.name)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(item.name)}
            onBlur={() => setActive(null)}
          >
            {href && !touch ? (
              <a href={href} target="_blank" rel="noreferrer" className={shell}>
                {Card}
              </a>
            ) : (
              /* a div rather than a button, because on touch this one has a
                 real link nested inside it and a button may not contain one */
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isOn}
                onClick={() => setActive(isOn ? null : item.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(isOn ? null : item.name);
                  }
                }}
                className={`${shell} cursor-pointer`}
              >
                {Card}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
