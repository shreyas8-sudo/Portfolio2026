/* Motion constants for framer-motion.
   CSS token equivalents live in globals.css @theme for Tailwind usage. */

export const dur = {
  quick: 0.16,
  base:  0.28,
  slow:  0.48,
} as const;

export const ease = {
  move: [0.22, 1, 0.36, 1]   as [number, number, number, number],
  fade: [0.4,  0, 0.2,  1]   as [number, number, number, number],
} as const;

export const spring = {
  settle: {
    type:      "spring" as const,
    stiffness: 420,
    damping:   26,
    mass:      0.9,
  },
} as const;

export const stagger    = 0.06;
export const maxStagger = 4;
