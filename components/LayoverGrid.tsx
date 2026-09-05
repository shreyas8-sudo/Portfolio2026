"use client";

import { useRef, useState } from "react";
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
          preload="none"
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
                    {item.link && (
                      <span
                        className="arrow-link mt-3"
                        style={{ color: "var(--color-blue)" }}
                      >
                        <span>{item.link.label}</span>
                        <Arrow color="var(--color-blue)" />
                      </span>
                    )}
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
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={shell}
                /* tapping on touch devices: first tap reveals, second opens */
                onClick={(e) => {
                  if (
                    window.matchMedia("(hover: none)").matches &&
                    active !== item.name
                  ) {
                    e.preventDefault();
                    setActive(item.name);
                  }
                }}
              >
                {Card}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setActive(isOn ? null : item.name)}
                className={shell}
              >
                {Card}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
