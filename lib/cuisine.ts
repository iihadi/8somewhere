/**
 * Cuisine labels get typed freehand — "French tasting menu", "Modern
 * French" and "French" are all the same kitchen, and grouping on the
 * raw string scatters them across three sections.
 *
 * Every cuisine string therefore resolves to a *family* (the kitchen)
 * plus an optional *style* (the modifier that was typed alongside it).
 * The raw string is never rewritten — it still shows on the review
 * page; only grouping and filtering go through the family.
 *
 * A review can override the guess with an explicit `cuisineFamily`,
 * for the cases no heuristic will get right.
 */

export const UNSPECIFIED = "Unspecified";

/**
 * Canonical family → the spellings that should fold into it. Keys are
 * the display form; aliases are matched lowercased, longest first, so
 * "dim sum" wins over "sum" and "north african" over "african".
 */
const FAMILIES: Record<string, string[]> = {
  French: ["french", "gascon", "provencal", "provençal", "alsatian", "bistro", "brasserie"],
  Italian: ["italian", "sicilian", "sardinian", "tuscan", "roman", "venetian", "neapolitan", "trattoria", "osteria", "pasta", "pizza", "pizzeria"],
  Japanese: ["japanese", "sushi", "omakase", "kaiseki", "ramen", "izakaya", "yakitori", "tempura", "donburi", "udon", "soba", "teppanyaki", "robata"],
  Chinese: ["chinese", "cantonese", "sichuan", "szechuan", "hunan", "shanghainese", "dim sum", "dumpling", "dumplings", "hot pot", "hotpot", "xinjiang", "taiwanese"],
  Korean: ["korean", "kbbq", "korean bbq", "bibimbap"],
  Thai: ["thai", "isaan", "isan"],
  Vietnamese: ["vietnamese", "pho", "banh mi"],
  Indian: ["indian", "punjabi", "goan", "keralan", "kerala", "south indian", "north indian", "gujarati", "bengali", "curry", "tandoori", "dosa", "biryani"],
  Pakistani: ["pakistani", "kashmiri", "lahori"],
  "Sri Lankan": ["sri lankan", "srilankan", "ceylonese"],
  Nepalese: ["nepalese", "nepali", "himalayan"],
  Malaysian: ["malaysian", "malay", "nyonya", "peranakan"],
  Singaporean: ["singaporean", "singapore"],
  Indonesian: ["indonesian", "balinese", "javanese"],
  Filipino: ["filipino", "pinoy"],
  Burmese: ["burmese", "myanmar"],
  Spanish: ["spanish", "basque", "catalan", "galician", "andalusian", "tapas", "paella", "asador"],
  Portuguese: ["portuguese", "madeiran", "azorean"],
  Greek: ["greek", "cretan", "hellenic", "souvlaki", "meze", "mezze"],
  Turkish: ["turkish", "anatolian", "ottoman", "kebab", "kebap", "ocakbasi", "ocakbaşı"],
  Lebanese: ["lebanese"],
  "Middle Eastern": ["middle eastern", "middle-eastern", "levantine", "persian", "iranian", "israeli", "palestinian", "syrian", "iraqi", "yemeni", "mezze bar"],
  "North African": ["north african", "moroccan", "tunisian", "algerian", "tagine"],
  Ethiopian: ["ethiopian", "eritrean"],
  "West African": ["west african", "nigerian", "ghanaian", "senegalese"],
  African: ["african", "south african"],
  Mexican: ["mexican", "oaxacan", "yucatan", "yucatán", "taqueria", "taquería", "taco", "tacos"],
  Peruvian: ["peruvian", "nikkei", "ceviche", "cevicheria", "cevichería"],
  Brazilian: ["brazilian", "churrascaria", "rodizio", "rodízio"],
  Argentinian: ["argentinian", "argentine", "parrilla"],
  "Latin American": ["latin american", "latin", "colombian", "venezuelan", "chilean", "cuban", "bolivian"],
  Caribbean: ["caribbean", "jamaican", "trinidadian", "bajan", "west indian"],
  British: ["british", "english", "scottish", "welsh", "gastropub", "pub", "chippy", "fish and chips", "sunday roast", "pie and mash"],
  Irish: ["irish"],
  American: ["american", "new american", "southern", "cajun", "creole", "tex mex", "tex-mex", "diner", "burger", "burgers", "hot dog", "soul food"],
  Barbecue: ["barbecue", "bbq", "smokehouse", "smoke house"],
  Nordic: ["nordic", "scandinavian", "danish", "swedish", "norwegian", "finnish", "icelandic", "new nordic"],
  German: ["german", "bavarian", "austrian", "swiss", "alpine"],
  "Eastern European": ["eastern european", "polish", "hungarian", "czech", "ukrainian", "russian", "romanian", "bulgarian", "balkan", "serbian", "croatian"],
  Georgian: ["georgian", "khachapuri"],
  Mediterranean: ["mediterranean", "med"],
  European: ["european", "continental"],
  "Pan-Asian": ["pan asian", "pan-asian", "asian", "oriental"],
  Seafood: ["seafood", "fish", "oyster", "oysters", "oyster bar", "shellfish", "raw bar", "crab"],
  Steakhouse: ["steakhouse", "steak house", "steak", "chophouse", "grill house"],
  Vegetarian: ["vegetarian", "vegan", "plant based", "plant-based", "veggie"],
  Bakery: ["bakery", "boulangerie", "patisserie", "pâtisserie", "viennoiserie", "bread"],
  "Café": ["cafe", "café", "coffee", "coffee shop", "espresso bar", "brunch", "breakfast"],
  Dessert: ["dessert", "desserts", "ice cream", "gelato", "gelateria", "chocolatier", "creperie", "crêperie", "pudding"],
  "Wine bar": ["wine bar", "wine", "enoteca", "natural wine"],
  "Cocktail bar": ["cocktail bar", "cocktails", "speakeasy", "bar"],
  Fusion: ["fusion", "eclectic"],
};

/**
 * Words that describe *how* a kitchen cooks rather than *what* it
 * cooks. Stripped before matching, then offered back as the style
 * label. Order matters: multi-word phrases are removed first.
 */
const STYLE_WORDS = [
  "tasting menu",
  "tasting",
  "fine dining",
  "fine-dining",
  "small plates",
  "sharing plates",
  "street food",
  "haute cuisine",
  "haute",
  "modern",
  "contemporary",
  "traditional",
  "classic",
  "classical",
  "rustic",
  "refined",
  "elevated",
  "upscale",
  "casual",
  "cheap",
  "budget",
  "new",
  "neo",
  "nouvelle",
  "inspired",
  "style",
  "styled",
  "influenced",
  "leaning",
  "ish",
  "food",
  "cuisine",
  "restaurant",
  "kitchen",
  "cooking",
  "seasonal",
  "farm to table",
  "farm-to-table",
  "nose to tail",
  "nose-to-tail",
  "michelin",
  "starred",
];

/** Sorted longest-first so the greediest alias wins. */
const ALIAS_INDEX: { alias: string; family: string }[] = Object.entries(FAMILIES)
  .flatMap(([family, aliases]) => aliases.map((alias) => ({ alias, family })))
  .sort((a, b) => b.alias.length - a.alias.length);

function normalise(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-zÀ-ɏ]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(s: string): string {
  return s.replace(/\b[a-zà-ɏ]/g, (c) => c.toUpperCase());
}

/** Styles read as prose ("Tasting menu"), not as titles. */
function sentenceCase(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Removes the style words, returning the leftover kitchen words. */
function stripStyle(normalised: string): { core: string; style: string[] } {
  let core = ` ${normalised} `;
  const style: string[] = [];
  for (const word of STYLE_WORDS) {
    const re = new RegExp(`\\s${word}\\s`, "g");
    if (re.test(core)) {
      style.push(word);
      core = core.replace(new RegExp(`\\s${word}\\s`, "g"), " ");
    }
  }
  return { core: core.replace(/\s+/g, " ").trim(), style };
}

export type CuisineParts = {
  /** The kitchen — what grouping and filtering key off. */
  family: string;
  /** The modifier that was typed alongside it, e.g. "Tasting menu". */
  style: string | null;
  /** Exactly what was typed, untouched. */
  raw: string;
};

/**
 * Splits a freehand cuisine string into family + style.
 *
 * "French tasting menu" → { family: "French", style: "Tasting menu" }
 * "Modern French"       → { family: "French", style: "Modern" }
 * "French"              → { family: "French", style: null }
 */
export function parseCuisine(raw: string, override?: string): CuisineParts {
  const trimmed = (raw ?? "").trim();
  if (override?.trim()) {
    return { family: override.trim(), style: trimmed || null, raw: trimmed };
  }
  if (!trimmed) return { family: UNSPECIFIED, style: null, raw: "" };

  const normalised = normalise(trimmed);
  const { core, style } = stripStyle(normalised);
  const haystack = ` ${core || normalised} `;

  const hit = ALIAS_INDEX.find(({ alias }) =>
    haystack.includes(` ${normalise(alias)} `)
  );

  if (!hit) {
    // Unknown kitchen: keep whatever was typed, minus the style words,
    // so at least "Modern Xyz" and "Xyz" still land together. If the
    // whole string *was* style words ("Small plates"), that string is
    // the family — repeating it as the style would read as a stutter.
    return {
      family: titleCase(core || normalised) || UNSPECIFIED,
      style: core && style.length ? sentenceCase(style.join(" ")) : null,
      raw: trimmed,
    };
  }

  // Anything left over after removing the matched alias is style too
  // ("french tasting menu" → alias "french", leftover "tasting menu").
  const leftover = haystack
    .replace(` ${normalise(hit.alias)} `, " ")
    .replace(/\s+/g, " ")
    .trim();
  const styleBits = [...style, leftover].filter(Boolean);

  return {
    family: hit.family,
    style: styleBits.length ? sentenceCase(styleBits.join(" ")) : null,
    raw: trimmed,
  };
}

/** Convenience for the many callers that only need the family. */
export function cuisineFamily(raw: string, override?: string): string {
  return parseCuisine(raw, override).family;
}

/** Every family name, for autocomplete in /edit. */
export const FAMILY_NAMES: string[] = Object.keys(FAMILIES).sort();
