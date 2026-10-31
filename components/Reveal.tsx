"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { dur, ease } from "@/lib/motion";

/**
 * Reveal on scroll: rises 16px and fades in once, when 20% is visible.
 * Use delay (seconds) to stagger siblings -- max 4 (0.06s each).
 * Reduced motion: 160ms opacity fade only, no movement.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, amount: 0.2 });
  const still = useReducedMotion();

  if (still) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: dur.quick, ease: ease.fade }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: dur.slow, ease: ease.move, delay }}
    >
      {children}
    </motion.div>
  );
}
