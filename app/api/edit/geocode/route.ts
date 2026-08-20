import { NextResponse } from "next/server";

/**
 * Proxies OpenStreetMap's Nominatim search — free, no API key, no
 * billing account. Nominatim's usage policy requires a real
 * identifying User-Agent (browsers can't send a custom one directly,
 * hence the server-side proxy) and asks callers to stay under ~1
 * request/second, which a single admin typing in a search box does
 * naturally.
 *
 * https://operations.osmfoundation.org/policies/nominatim/
 */

export type GeocodeResult = {
  label: string;
  address: string | null;
  city: string;
  country: string;
  lat: number;
  lng: number;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "8somewhere-review-blog/1.0 (personal restaurant blog)";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Lookup failed." }, { status: 502 });
  }

  const raw = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
  }>;

  const results: GeocodeResult[] = raw.map((r) => {
    const a = r.address ?? {};
    const streetBits = [a.house_number, a.road].filter(Boolean).join(" ");
    const city = a.city || a.town || a.village || a.suburb || "";
    const postcode = a.postcode ?? "";
    const address =
      [streetBits, city, postcode].filter(Boolean).join(", ") || null;

    return {
      label: r.display_name,
      address,
      city,
      country: a.country ?? "",
      lat: Number(r.lat),
      lng: Number(r.lon),
    };
  });

  return NextResponse.json({ results });
}
