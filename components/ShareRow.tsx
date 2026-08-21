"use client";

import { useState } from "react";

/**
 * Download is a plain link — the browser handles the save dialog on
 * its own, no JS needed. Copy-link is the only bit that needs client
 * state, for the "Copied" confirmation.
 */
export default function ShareRow({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/reviews/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable — nothing to do
      // but leave the button inert; there's no sensible fallback UI.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`/reviews/${slug}/share-card`}
        download
        className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-ember/40 hover:text-cream"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden>
          <path
            d="M12 3v13m0 0l-5-5m5 5l5-5M4 20h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Download card
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-ember/40 hover:text-cream"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden>
          <path
            d="M10 13a5 5 0 007.07 0l2-2a5 5 0 00-7.07-7.07l-1 1M14 11a5 5 0 00-7.07 0l-2 2a5 5 0 007.07 7.07l1-1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
