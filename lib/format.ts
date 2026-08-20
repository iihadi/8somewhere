/**
 * Dates are formatted from the raw ISO string rather than via `Date`,
 * so the server render and the browser render can never disagree about
 * timezone — the date shown is always the local date of the booking.
 */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y, m, d, time: iso.slice(11, 16) };
}

export function formatDate(iso: string) {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatShortDate(iso: string) {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

export function formatTime(iso: string) {
  return parts(iso).time;
}

export function year(iso: string) {
  return parts(iso).y;
}
