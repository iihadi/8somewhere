"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Next remounts `template.tsx` on every navigation (unlike layout.tsx,
 * which persists) — which makes it the right place for a route-enter
 * transition. Kept subtle: a short fade + lift, not a full-page wipe,
 * so it doesn't fight the scroll-triggered <Reveal> animations already
 * inside each page.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  const reduce = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
