import { site } from './site';
import type { Menu } from './menu';

const BASE = site.url;
export const restaurantId = `${BASE}/#restaurant`;

/** Restaurant schema, built only from site.json so it always matches the visible hours. */
export function restaurant() {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': restaurantId,
    name: site.name,
    url: `${BASE}/`,
    description:
      'Indian restaurant on Maldon High Street. Clay-oven tandoori grills, vegan and dairy-free options and a full allergen guide.',
    servesCuisine: 'Indian',
    telephone: site.phone.e164,
    address: { '@type': 'PostalAddress', ...site.address },
    openingHoursSpecification: [
      ...site.hours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      })),
      // Special closures: zero hours for the whole range.
      ...(site.closures as { from: string; to: string }[]).map((c) => ({
        '@type': 'OpeningHoursSpecification',
        opens: '00:00',
        closes: '00:00',
        validFrom: c.from,
        validThrough: c.to,
      })),
    ],
    acceptsReservations: true,
    hasMenu: `${BASE}/menu/`,
    image: [`${BASE}/og/home-1200x630.jpg`],
    sameAs: [...Object.values(site.social), site.googleBusinessProfile],
    award: site.awards.map((a) => a.name),
  };
  // Only emitted once confirmed in site.json (see docs/10).
  const geo = site.geo as { latitude: number; longitude: number } | null;
  if (geo) data.geo = { '@type': 'GeoCoordinates', latitude: geo.latitude, longitude: geo.longitude };
  return data;
}

export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: `${BASE}/`,
    inLanguage: 'en-GB',
    publisher: { '@id': restaurantId },
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${BASE}${t.path}`,
    })),
  };
}

/** Menu schema. Prices and names only: never allergen claims (docs/04). */
export function menuSchema(menu: Menu) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `${menu.title}, ${site.name}`,
    url: `${BASE}${menu.path}`,
    inLanguage: 'en-GB',
    hasMenuSection: menu.sections.map((s) => ({
      '@type': 'MenuSection',
      name: s.title,
      ...(s.note ? { description: s.note } : {}),
      hasMenuItem: s.items.map((i) => ({
        '@type': 'MenuItem',
        name: i.name,
        ...(i.description ? { description: i.description } : {}),
        offers: i.prices.map((p) => ({
          '@type': 'Offer',
          price: p.amount.toFixed(2),
          priceCurrency: 'GBP',
          ...(p.label ? { name: p.label } : {}),
        })),
        ...(i.dietary.includes('vegan') ? { suitableForDiet: 'https://schema.org/VeganDiet' } : {}),
      })),
    })),
  };
}

export function heritageArticle(imageUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Maldon Through Time',
    author: { '@type': 'Person', name: 'Stephen Nunn' },
    publisher: { '@id': restaurantId },
    about: { '@type': 'Place', name: 'Maldon, Essex' },
    inLanguage: 'en-GB',
    mainEntityOfPage: `${BASE}/heritage/`,
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}
