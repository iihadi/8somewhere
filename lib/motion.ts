"use client";

import { useReducedMotion } from "framer-motion";

/**
 * True when the user has prefers-reduced-motion set. The blanket CSS
 * rule in globals.css already collapses pure CSS transitions/keyframes
 * to ~0 duration — this hook is for Framer Motion's `animate` /
 * `whileInView` / `initial` props, which are driven by the Web
 * Animations API rather than CSS transitions, so that CSS rule doesn't
 * reach them. Every component that uses those props should check this
 * and either skip the animated `initial` state or collapse its
 * `transition` to duration: 0.
 */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}

export const EXPO = [0.16, 1, 0.3, 1] as const;
