"use client";

import { useEffect, useRef } from "react";
import type { Review } from "@/data/seed-reviews";
import { TIERS } from "@/lib/tiers";
import "leaflet/dist/leaflet.css";

/**
 * Leaflet is loaded dynamically inside the effect rather than imported
 * at module scope — it touches `window` on import, which breaks SSR.
 *
 * Markers are divIcons rather than Leaflet's default image markers:
 * the defaults reference icon PNGs by a relative path that bundlers
 * rewrite incorrectly, and divIcons let the pins carry the site's
 * tier colours anyway.
 */
export default function MapView({ reviews }: { reviews: Review[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const points: [number, number][] = [];

      for (const r of reviews) {
        if (r.lat == null || r.lng == null) continue;
        const accent = TIERS[r.tier].accent;
        const stars = TIERS[r.tier].stars;

        const icon = L.divIcon({
          className: "",
          html: `<span style="
            display:grid;place-items:center;
            width:26px;height:26px;border-radius:999px;
            background:#0e0e12;
            border:2px solid ${accent};
            box-shadow:0 2px 10px rgba(0,0,0,.6);
            color:${accent};
            font:600 11px/1 ui-sans-serif,system-ui,sans-serif;
          ">${stars === null ? "·" : stars}</span>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([r.lat, r.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<strong>${escapeHtml(r.name)}</strong><br>` +
            `<span style="opacity:.7">${escapeHtml(r.cuisine)} · ${escapeHtml(r.city)}</span><br>` +
            `<a href="/reviews/${r.slug}">Read the review →</a>`
        );
        points.push([r.lat, r.lng]);
      }

      if (points.length > 1) {
        map.fitBounds(points, { padding: [48, 48] });
      } else if (points.length === 1) {
        map.setView(points[0], 14);
      } else {
        map.setView([51.5, -0.12], 4);
      }
    })();

    return () => {
      cancelled = true;
      const map = mapRef.current as { remove?: () => void } | null;
      if (map?.remove) map.remove();
      mapRef.current = null;
    };
  }, [reviews]);

  return (
    <div
      ref={containerRef}
      className="h-[70vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-line"
    />
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
