import siteJson from '../../data/site.json';
import metaJson from '../../seo/meta.json';

export const site = siteJson;

/** Draft builds (previews) allow unreviewed allergen data, show a banner and are noindex. */
export const isDraft = process.env.ALLOW_UNREVIEWED === '1';

export type PageMeta = { title: string; description: string };
export const meta = metaJson as Record<string, PageMeta>;

export const phoneHref = `tel:${site.phone.e164}`;
export const smsHref = `sms:${site.sms.e164}`;
export const directionsHref =
  'https://www.google.com/maps/search/?api=1&query=Maldon+Spice+111+High+St+Maldon+CM9+5BS';

/** Mobi links, falling back to the Visit page (with phone numbers) until Mobi URLs are confirmed. */
export const bookHref = site.mobi.bookUrl ?? '/visit/#reserve';
export const orderHref = site.mobi.orderUrl ?? '/visit/#order';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** "Tuesday to Sunday" for a consecutive run of days, otherwise a comma list. */
export function dayRange(days: string[]): string {
  const idx = days.map((d) => DAY_ORDER.indexOf(d)).sort((a, b) => a - b);
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (consecutive && idx.length > 2) return `${DAY_ORDER[idx[0]]} to ${DAY_ORDER[idx[idx.length - 1]]}`;
  return idx.map((i) => DAY_ORDER[i]).join(', ');
}

export type HoursLine = { days: string; times: string };
export const hoursLines: HoursLine[] = site.hours.map((h) => ({
  days: dayRange(h.days),
  times: `${h.opens} – ${h.closes}`,
}));

/** One-line summary used in the hero: "Open Tuesday to Sunday, 17:00 – 22:00". */
export const hoursSummary = `Open ${hoursLines.map((l) => `${l.days}, ${l.times}`).join('; ')}`;

export type Closure = { from: string; to: string; note?: string };
export const closures: Closure[] = site.closures as Closure[];

function fmtDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
}

/** "Closed 25 to 27 December. Back on 28 December." */
export function closureText(c: Closure): string {
  if (c.note) return c.note;
  const back = new Date(`${c.to}T12:00:00Z`);
  back.setUTCDate(back.getUTCDate() + 1);
  const range = c.from === c.to ? fmtDay(c.from) : `${fmtDay(c.from).split(' ')[0]} to ${fmtDay(c.to)}`;
  return `Closed ${range}. Back on ${fmtDay(back.toISOString().slice(0, 10))}.`;
}

export const year = new Date().getFullYear();
