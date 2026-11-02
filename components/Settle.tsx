"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE_MOVE: [number, number, number, number] = [0.22, 1, 0.36, 1]; // --ease-move
const EASE_FADE: [number, number, number, number] = [0.4, 0, 0.2, 1];  // --ease-fade

/**
 * Settle: fade + rise animation for page content.
 *
 * Above fold (default): animates on mount.
 * Below fold (viewport=true): animates once when 20% of the element is visible.
 *
 * prefers-reduced-motion: 160ms opacity-only fade.
 */
export default function Settle({
  children,
  delay = 0,
  distance = 16,
  className,
  as = "div",
  viewport = false,
}: {
  children: React.ReactNode;
  delay?: number;
  /** px to rise from; default 16 */
  distance?: number;
  className?: string;
  as?: "div" | "li";
  viewport?: boolean;
}) {
  const still = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;

  const initial = { opacity: 0, y: still ? 0 : distance };
  const show = { opacity: 1, y: 0 };
  const transition = {
    duration: still ? 0.16 : 0.48, // --dur-quick or --dur-slow
    ease: still ? EASE_FADE : EASE_MOVE,
    delay,
  };

  if (viewport) {
    return (
      <Tag
        className={className}
        initial={initial}
        whileInView={show}
        viewport={{ once: true, amount: 0.2 }}
        transition={transition}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      initial={initial}
      animate={show}
      transition={transition}
    >
      {children}
    </Tag>
  );
}
