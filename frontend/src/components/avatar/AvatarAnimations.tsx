import { Variants } from "framer-motion";

export const pulseVariants: Variants = {
  idle: {
    scale: [1, 1.02, 1],
    opacity: [0.7, 0.9, 0.7],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  listening: {
    scale: [1, 1.06, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  thinking: {
    rotate: [0, 360],
    scale: [1, 1.03, 1],
    transition: {
      rotate: { duration: 6, repeat: Infinity, ease: "linear" },
      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  },
  speaking: {
    scale: [1, 1.08, 0.98, 1.04, 1],
    opacity: [0.9, 1, 0.85, 1, 0.9],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  error: {
    scale: [1, 0.98, 1],
    opacity: [0.6, 0.8, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const waveformVariants: Variants = {
  initial: { height: 6 },
  animate: (i: number) => ({
    height: [8, 28, 12, 36, 16][i % 5],
    transition: {
      duration: 0.6 + (i % 3) * 0.2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  }),
};
