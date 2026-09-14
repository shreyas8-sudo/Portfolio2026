"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Arrival, one level up from Settle.
 *
 * Settle moves a single element. PageIn covers a whole route, so it only
 * fades: a page that slides has to move its entire height, and the sticky
 * sidebar inside a case study would be riding a transform while it did.
 * The rise is left to the Settle blocks in the first screenful, which is
 * the only part anyone sees on arrival anyway.
 *
 * Fast on purpose. This is a transition, not a performance.
 */
export default function PageIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const still = useReducedMotion();

  if (still) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
