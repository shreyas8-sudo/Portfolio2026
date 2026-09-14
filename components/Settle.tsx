"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Elements drop in and settle, once, on load.
 *
 * Deliberately restrained. A spring with a small overshoot reads as weight,
 * which is the point, but anything bouncier makes someone wait to read a
 * name they came here to read. Total is under half a second.
 *
 * Respects prefers-reduced-motion by rendering the final state immediately.
 */
export default function Settle({
  children,
  delay = 0,
  distance = 18,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  /** how far above its resting place it starts */
  distance?: number;
  className?: string;
  /** so a settling element can still be a list item where one belongs */
  as?: "div" | "li";
}) {
  const still = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;
  const Plain = as === "li" ? "li" : "div";

  if (still) return <Plain className={className}>{children}</Plain>;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: -distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 26, // just under critical, so it overshoots once and settles
        mass: 0.9,
        delay,
        opacity: { duration: 0.28, delay, ease: "easeOut" },
      }}
    >
      {children}
    </Tag>
  );
}
