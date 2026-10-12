import menuJson from '../../data/menu.json';

export type Price = { amount: number; label?: string };
export type AllergenStatus = 'listed' | 'not-on-allergy-sheet' | 'needs-check' | 'not-applicable';
export type Item = {
  id: string;
  name: string;
  description: string;
  prices: Price[];
  allergens: string[] | null;
  allergenStatus: AllergenStatus;
  dietary: string[];
  preorder: boolean;
  reviewed: boolean;
  dairyFreeMenu?: boolean;
};
export type Section = { id: string; title: string; note: string; items: Item[] };
export type Menu = {
  id: string;
  title: string;
  path: string;
  filterable: boolean;
  availability?: string;
  sections: Section[];
};

export const legend = menuJson.legend as Record<string, string>;
export const menus = menuJson.menus as Menu[];

export function getMenu(id: string): Menu {
  const m = menus.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown menu "${id}"`);
  return m;
}

const allItems = new Map(menus.flatMap((m) => m.sections.flatMap((s) => s.items.map((i) => [i.id, i] as const))));

export function getItem(id: string): Item {
  const i = allItems.get(id);
  if (!i) throw new Error(`Unknown menu item "${id}" (check data/menu.json)`);
  return i;
}

/** Short legend line: "d dairy · g gluten · n tree nuts ..." */
export const legendLine = Object.entries(legend)
  .map(([code, label]) => `${code} ${shortLabel(label)}`)
  .join(' · ');

export function shortLabel(label: string): string {
  const map: Record<string, string> = {
    'Dairy (milk)': 'dairy',
    'Cereals containing gluten': 'gluten',
  };
  return map[label] ?? label.toLowerCase();
}

/** Filter chip names, in legend order. */
export const filterChips = Object.entries(legend).map(([code, label]) => ({
  code,
  label: shortLabel(label).replace(/^\w/, (c) => c.toUpperCase()),
}));

export function fmtPrice(n: number): string {
  return n.toFixed(2);
}

/** Codes in brackets after the description, only when the allergy sheet lists them. */
export function codesText(item: Item): string {
  if (item.allergenStatus === 'listed' && item.allergens && item.allergens.length) {
    return `(${item.allergens.join(', ')})`;
  }
  return '';
}

export function statusNote(item: Item): string {
  switch (item.allergenStatus) {
    case 'needs-check':
    case 'not-on-allergy-sheet':
      return 'Allergens not yet confirmed, please ask';
    default:
      return '';
  }
}
