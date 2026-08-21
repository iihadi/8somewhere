import { NextResponse } from "next/server";

/**
 * Proxies OpenStreetMap's Nominatim search with `extratags=1` — the
 * same free, no-key, no-billing-account service /api/edit/geocode
 * already uses for addresses, just asking it for more. OSM restaurant
 * entries are often tagged with a `cuisine` value (and sometimes
 * `phone`/`website`), which is enough to auto-fill "what kind of
 * restaurant is this" without typing it in by hand.
 *
 * Considered and dropped: Yelp Fusion (needs a developer sign-up and
 * an API key to manage) and Google Places (needs a billing account on
 * file even to stay inside the free tier). Nominatim needs neither —
 * it's the same zero-setup story the rest of this project already
 * relies on. The tradeoff is coverage: not every OSM entry carries a
 * cuisine tag, and OSM doesn't carry price data at all, so this is a
 * head start rather than a guarantee.
 *
 * https://nominatim.org/release-docs/latest/api/Search/
 */

export type EnrichMatch = {
  name: string;
  /** OSM's `cuisine` tag, title-cased — e.g. "french;bistro" -> "French, Bistro". */
  cuisine: string;
  address: string | null;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "8somewhere-review-blog/1.0 (personal restaurant blog)";

function formatCuisine(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/_/g, " "))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(", ");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = searchParams.get("q")?.trim();
  const city = searchParams.get("city")?.trim();
  if (!term || term.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", city ? `${term}, ${city}` : term);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("extratags", "1");
  url.searchParams.set("limit", "5");

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Lookup failed." }, { status: 502 });
  }

  const raw = (await res.json()) as Array<{
    name?: string;
    display_name: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
    extratags?: Record<string, string>;
  }>;

  const results: EnrichMatch[] = raw.map((r) => {
    const a = r.address ?? {};
    const extra = r.extratags ?? {};
    const streetBits = [a.house_number, a.road].filter(Boolean).join(" ");
    const city = a.city || a.town || a.village || a.suburb || "";
    const postcode = a.postcode ?? "";
    const address =
      [streetBits, city, postcode].filter(Boolean).join(", ") || null;

    return {
      name: r.name || a.amenity || r.display_name.split(",")[0],
      cuisine: formatCuisine(extra.cuisine),
      address,
      city,
      country: a.country ?? "",
      lat: Number(r.lat) || null,
      lng: Number(r.lon) || null,
      phone: extra.phone || extra["contact:phone"] || null,
      website: extra.website || extra["contact:website"] || null,
    };
  });

  return NextResponse.json({ results });
}
