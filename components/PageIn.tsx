"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Route-level fade. Fast on purpose -- a transition, not a performance.
 * Uses --ease-fade (cubic-bezier(0.4,0,0.2,1)) at --dur-quick (160ms);
 * reduced-motion keeps the same fade, just stays at 160ms.
 */
export default function PageIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const still = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: still ? 0.16 : 0.28,
        ease: [0.4, 0, 0.2, 1], // --ease-fade
      }}
    >
      {children}
    </motion.div>
  );
}
