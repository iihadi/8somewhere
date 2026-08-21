"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Brand from "@/components/Brand";

const links = [
  { href: "/reviews", label: "Reviews" },
  { href: "/map", label: "Map" },
  { href: "/cuisines", label: "Cuisines" },
  { href: "/stats", label: "Stats" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/about", label: "About" },
];

// Doesn't get a nav-pill entry — it lives as an icon so the row of
// text links doesn't get any longer, but "/" still jumps here from
// anywhere via the global shortcut in SiteLayout.

export default function Nav() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 12));

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-ink/70 backdrop-blur-xl border-b border-line"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-line transition-transform duration-500 group-hover:rotate-12">
            <Image
              src="/logo-mark.png"
              alt=""
              width={28}
              height={27}
              className="opacity-90"
            />
          </span>
          <Brand className="font-display text-lg tracking-tight" />
        </Link>

        <ul className="flex flex-wrap items-center gap-1 text-sm">
          <li>
            <Link
              href="/search"
              aria-label="Search"
              title="Search (press /)"
              className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors ${
                pathname.startsWith("/search")
                  ? "text-cream"
                  : "text-muted hover:text-cream"
              }`}
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          </li>
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`relative rounded-full px-3.5 py-2 transition-colors ${
                    active ? "text-cream" : "text-muted hover:text-cream"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-surface-2 ring-1 ring-line"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.header>
  );
}
