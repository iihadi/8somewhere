import manifest from "@/data/photos.json";

export type Photo = { src: string; width: number; height: number };

const photos = manifest as Record<string, Photo[]>;

/** Photos for a review slug, or [] if none have been added yet. */
export function photosFor(slug: string): Photo[] {
  return photos[slug] ?? [];
}

export function coverFor(slug: string): Photo | null {
  return photosFor(slug)[0] ?? null;
}

/**
 * Deterministic gradient used wherever a real photo does not exist yet.
 * Same slug always gets the same colours, so the grid looks intentional
 * rather than random.
 */
export function placeholderGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const a = h;
  const b = (h + 48) % 360;
  return `linear-gradient(135deg, oklch(0.42 0.11 ${a}) 0%, oklch(0.24 0.07 ${b}) 55%, oklch(0.16 0.03 ${a}) 100%)`;
}
