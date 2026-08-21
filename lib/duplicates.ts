/**
 * Cheap fuzzy match for "did I already add this restaurant" — no
 * dependency, just Levenshtein distance normalised to 0..1 similarity,
 * with a city match nudging the score since restaurant chains and
 * generic names ("The Bar", "Kitchen") repeat across cities on
 * purpose and shouldn't be flagged.
 */

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row.push(Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost));
    }
    prev = row;
  }
  return prev[b.length];
}

/** 1 = identical, 0 = nothing in common. */
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

export type DuplicateCandidate = { slug: string; name: string; city: string };
export type DuplicateMatch = DuplicateCandidate & { score: number };

const NAME_THRESHOLD = 0.72;
const CITY_BONUS = 0.08;

/**
 * Everything close enough to `name`/`city` to be worth a second look,
 * best match first. `excludeSlug` skips a review comparing against
 * itself while editing.
 */
export function findPossibleDuplicates(
  candidates: DuplicateCandidate[],
  name: string,
  city: string,
  excludeSlug?: string
): DuplicateMatch[] {
  const target = normalise(name);
  if (target.length < 3) return [];
  const targetCity = normalise(city);

  const matches = candidates
    .filter((c) => c.slug !== excludeSlug && c.name.trim())
    .map((c) => {
      let score = similarity(target, normalise(c.name));
      if (targetCity && normalise(c.city) === targetCity) score += CITY_BONUS;
      return { ...c, score: Math.min(score, 1) };
    })
    .filter((m) => m.score >= NAME_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return matches.slice(0, 5);
}
