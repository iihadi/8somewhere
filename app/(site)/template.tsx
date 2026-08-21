"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Next remounts `template.tsx` on every navigation (unlike layout.tsx,
 * which persists) — which makes it the right place for a route-enter
 * transition. Kept subtle: a short fade + lift, not a full-page wipe,
 * so it doesn't fight the scroll-triggered <Reveal> animations already
 * inside each page. Respects prefers-reduced-motion globally via
 * globals.css.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
