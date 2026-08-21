import type { Tier } from "@/lib/tiers";
import type { BadgeKey } from "@/lib/badges";

export type Dish = {
  name: string;
  note: string;
};

export type Photo = {
  url: string;
  width: number;
  height: number;
  /** Shown under the photo in the lightbox, and used as its alt text. */
  caption?: string;
};

export type Review = {
  /** URL segment. Also the folder name under /public/photos/<slug>/ */
  slug: string;
  name: string;
  city: string;
  country: string;
  /** null when the exact address was never logged */
  address: string | null;
  /** Looked up via /edit's OpenStreetMap search. Optional — address text alone is fine. */
  lat?: number;
  lng?: number;
  cuisine: string;
  /**
   * Overrides the family that `cuisine` would otherwise be filed
   * under. Only needed where the guess in lib/cuisine.ts gets it
   * wrong — "French tasting menu" already files itself under French.
   */
  cuisineFamily?: string;
  /**
   * ISO timestamp from the calendar booking, or a plain YYYY-MM-DD from
   * the ledger. null when the visit was never dated anywhere.
   */
  visitedAt: string | null;
  /** true when the date is a best guess rather than a confirmed booking */
  dateApprox?: boolean;
  /** £ – ££££, or null where it was never noted */
  price: string | null;
  tier: Tier;
  /** The diner's own verdict, verbatim from the ledger. */
  quote: string | null;
  /** One-line summary shown on cards */
  verdict: string;
  /** Only populated where a specific dish was actually named */
  dishes: Dish[];
  /** Each string is a paragraph */
  body: string[];
  tags: string[];
  /** Uploaded via /edit. Empty until photos are added. */
  photos?: Photo[];
  /** Permanently closed */
  closed?: boolean;
  /**
   * Been back at least once. Kept as the source of truth for older
   * entries written before visits were counted; `visitCount` in
   * lib/derive.ts reads through it.
   */
  revisited?: boolean;
  /**
   * Total number of times I've eaten here, `visitedAt` included. 1 or
   * undefined means a single visit; 3 means two returns.
   */
  visitCount?: number;
  /** The most recent return, when it was worth dating separately. */
  lastVisitedAt?: string | null;
  /**
   * Shorthand verdicts that the star rating can't express — "Must
   * visit", "One and done". Shown alongside the stars, never instead.
   */
  badges?: BadgeKey[];
  /** Open question flagged in the ledger — needs confirming */
  needsCheck?: string;
};

/**
 * Sourced from the Verdict Ledger (dining-project-brief.md +
 * restaurant_verdicts_to_fill.csv), cross-referenced against Google
 * Calendar bookings and Gmail reservation history.
 *
 * `quote` is the diner's own wording. `body` is written around it and
 * adds no sensory detail that wasn't in the source — if a dish isn't
 * named in the ledger, it isn't named here.
 */
export const seedReviews: Review[] = [
  /* ------------------------------------------------------------------ */
  /* LOVED — benchmark tier                                             */
  /* ------------------------------------------------------------------ */
  {
    slug: "row-on-5",
    name: "Row on 5",
    city: "London",
    country: "UK",
    address: "5 Savile Row, London W1S 3PB",
    cuisine: "Modern British",
    visitedAt: "2026-05-15T18:30:00+01:00",
    price: "££££",
    tier: "loved",
    quote:
      "Favourite restaurant of all time. The benchmark everything else gets measured against.",
    verdict: "Favourite restaurant of all time. The benchmark.",
    dishes: [],
    body: [
      "This is the one everything else on this site is being graded against. When a review here says a place is a step below something, this is the something.",
      "It also sets the bar for steak frites specifically — Les Bistrots Fables in Paris does a good version, and it still came in under this one.",
    ],
    tags: ["dinner", "benchmark", "favourite"],
  },
  {
    slug: "8282",
    name: "8282",
    city: "New York",
    country: "USA",
    address: "141 1st Ave, New York, NY",
    cuisine: "Korean BBQ",
    visitedAt: "2025-04-19T20:00:00-04:00",
    price: "£££",
    tier: "loved",
    quote: "Korean BBQ — one of the best meals I've ever eaten.",
    verdict: "One of the best meals I've ever eaten.",
    dishes: [],
    body: [
      "The high point of the New York trip and one of the best meals full stop — not just of the trip, and not just of that year.",
      "Korean barbecue keeps landing near the top of this list, which is starting to look less like coincidence and more like a preference.",
    ],
    tags: ["dinner", "trip: NYC 2025", "favourite"],
  },
  {
    slug: "singburi",
    name: "Singburi",
    city: "London",
    country: "UK",
    address: "Montacute Yards, 185-186 Shoreditch High Street, London E1 6HU",
    cuisine: "Thai",
    visitedAt: "2025-10-24T14:30:00+01:00",
    price: "£££",
    tier: "loved",
    quote: "Thai. Loved it.",
    verdict: "Loved it. Thai cooking at the top of its game.",
    dishes: [],
    body: [
      "Loved it, straightforwardly. Thai is one of the cuisines that consistently delivers here, and Singburi is the high-water mark of it.",
      "Lunch on a Comic Con Saturday, with Casa Fofó booked for the same evening — a good day's eating by any measure.",
    ],
    tags: ["lunch", "favourite"],
  },
  {
    slug: "osteria-angelina",
    name: "Osteria Angelina",
    city: "London",
    country: "UK",
    address: "1 Nicholls & Clarke Yard, London E1 6JN",
    cuisine: "Italian",
    visitedAt: "2026-07-08T14:30:00+01:00",
    price: "£££",
    tier: "loved",
    quote: "Italian. Loved it.",
    verdict: "Loved it.",
    dishes: [],
    body: [
      "Loved it. One of the few Italian places to make the top tier, in a list otherwise dominated by Thai, Korean and Filipino cooking.",
      "A weekday lunch booking in a Shoreditch yard that's easy to walk straight past.",
    ],
    tags: ["lunch", "favourite"],
  },
  {
    slug: "chez-rose",
    name: "Chez Rose",
    city: "London",
    country: "UK",
    address: "5 Pollen Street, London W1S 1NE",
    cuisine: "French bistro",
    visitedAt: "2026-06-20T18:00:00+01:00",
    price: "££££",
    tier: "loved",
    quote:
      "Chef Spencer Metzger's French bistro — his food specifically is a standout, actively following him for new openings.",
    verdict: "Spencer Metzger's cooking is the draw. Following him wherever he goes next.",
    dishes: [
      {
        name: "Steak frites",
        note: "The benchmark version — Les Bistrots Fables in Paris came in a step below it.",
      },
    ],
    body: [
      "The chef is the reason, not the room. Spencer Metzger's food is a standout on its own terms, enough that his next opening is worth following rather than waiting to hear about.",
      "The steak frites here is the reference point the Paris equivalent got measured against, and won.",
    ],
    tags: ["dinner", "favourite"],
  },
  {
    slug: "impala",
    name: "Impala",
    city: "London",
    country: "UK",
    address: null,
    cuisine: "Modern British",
    visitedAt: null,
    price: null,
    tier: "loved",
    quote: "Part of the Super8 group — my favourite of that group.",
    verdict: "The pick of the Super 8 group.",
    dishes: [],
    body: [
      "Best of the Super 8 restaurants, which is a group that also includes Smoking Goat, Kiln and Brat — all of which landed somewhere on this site.",
      "The one from that group worth prioritising a return to, where OMA explicitly wasn't.",
    ],
    tags: ["super 8", "favourite"],
  },
  {
    slug: "smoking-goat",
    name: "Smoking Goat",
    city: "London",
    country: "UK",
    address: "64 Shoreditch High Street, London E1 6JJ",
    cuisine: "Thai",
    visitedAt: null,
    price: null,
    tier: "loved",
    quote: "Super8 group — liked it enough to go back twice.",
    revisited: true,
    verdict: "Liked it enough to go back twice.",
    dishes: [],
    body: [
      "Two visits, which on this list means more than any adjective. The repeats cluster at the casual, bold-flavour end and this is the clearest example.",
      "Preferred to Kiln, its sibling in the same group.",
    ],
    tags: ["super 8", "repeat visit"],
  },
  {
    slug: "septime",
    name: "Septime",
    city: "Paris",
    country: "France",
    address: "80 Rue de Charonne, 75011 Paris",
    cuisine: "Modern French",
    visitedAt: "2026-08-13T19:00:00+02:00",
    price: "££££",
    tier: "loved",
    quote:
      "Fun, tasty, and vegetable-forward — my favourite of the 1-star restaurants I've been to, and not badly priced for the tier.",
    verdict: "Favourite one-star meal so far, and fairly priced for the tier.",
    dishes: [],
    body: [
      "The best of the Michelin-starred meals so far — fun and vegetable-forward, which is not how that tier usually goes.",
      "Also the rare starred restaurant where the bill felt proportionate. Le George, the night before, cost more and delivered less.",
    ],
    tags: ["dinner", "michelin", "trip: Paris 2026", "favourite"],
  },

  /* ------------------------------------------------------------------ */
  /* LIKED                                                              */
  /* ------------------------------------------------------------------ */
  {
    slug: "anglothai",
    name: "AngloThai",
    city: "London",
    country: "UK",
    address: "22-24 Seymour Place, London W1H 7NL",
    cuisine: "Thai / British",
    visitedAt: "2026-06-06T12:00:00+01:00",
    price: "££££",
    tier: "liked",
    quote: "Good, but a step below Row on 5.",
    verdict: "Good — but measured against Row on 5, a step down.",
    dishes: [],
    body: [
      "Good, and graded against the benchmark rather than against the average. A step below Row on 5 still puts it well ahead of most things.",
      "Thai technique on British produce, in a year that also included Singburi — strong company to be judged in.",
    ],
    tags: ["lunch"],
  },
  {
    slug: "donia",
    name: "Donia",
    city: "London",
    country: "UK",
    address: "14 Kingly Court, London W1B 5PW",
    cuisine: "Filipino",
    visitedAt: "2026-05-22T19:00:00+01:00",
    price: "£££",
    tier: "liked",
    quote: "Filipino. Liked it.",
    verdict: "Liked it.",
    dishes: [],
    body: [
      "Liked it. Filipino cooking has a decent hit rate on this list — Tabachoy in Philadelphia was the other one, and this was the better of the two.",
    ],
    tags: ["dinner"],
  },
  {
    slug: "miga",
    name: "Miga",
    city: "London",
    country: "UK",
    address: "1 Mare Street, London E8 4RP",
    cuisine: "Korean",
    visitedAt: "2025-10-04T18:00:00+01:00",
    price: "£££",
    tier: "liked",
    quote: "Korean. Liked it.",
    verdict: "Liked it.",
    dishes: [],
    body: [
      "Liked it, without it reaching the level of 8282 in New York — which is a high bar for any Korean restaurant to clear.",
    ],
    tags: ["dinner"],
  },
  {
    slug: "kiln",
    name: "Kiln",
    city: "London",
    country: "UK",
    address: "58 Brewer Street, London W1F 9TL",
    cuisine: "Thai",
    visitedAt: null,
    price: null,
    tier: "liked",
    quote: "Good, but I prefer Smoking Goat.",
    verdict: "Good, but Smoking Goat does it better.",
    dishes: [],
    body: [
      "Good in its own right, and directly comparable to its Super 8 sibling — Smoking Goat wins that one, and won it twice over.",
    ],
    tags: ["super 8"],
  },
  {
    slug: "brat",
    name: "Brat",
    city: "London",
    country: "UK",
    address: "4 Redchurch Street, London E1 6JL",
    cuisine: "Basque / grill",
    visitedAt: null,
    price: null,
    tier: "liked",
    quote: "Solid, but not compelling enough to make me want to return.",
    verdict: "Solid. Not compelling enough to book again.",
    dishes: [],
    body: [
      "Solid without generating any pull to go back. That's a recurring pattern with the more celebrated London restaurants on this list — nothing wrong with the meal, no particular reason to repeat it.",
    ],
    tags: ["super 8"],
  },
  {
    slug: "oma",
    name: "OMA",
    city: "London",
    country: "UK",
    address: "2-4 Bedale Street, London SE1 9AL",
    cuisine: "Greek",
    visitedAt: "2026-04-04T15:00:00+01:00",
    price: "££££",
    tier: "liked",
    quote:
      "David Carter group — liked it, but not exceptional enough to prioritise a revisit (unlike Impala).",
    verdict: "Liked it, but not one to prioritise going back to.",
    dishes: [],
    body: [
      "Liked it. Didn't leave wanting to rebook, which is the dividing line on this list between the top tier and everything below it.",
      "Impala is the group meal that earned that priority instead.",
    ],
    tags: ["lunch"],
  },
  {
    slug: "rosas-thai",
    name: "Rosa's Thai",
    city: "London",
    country: "UK",
    address: null,
    cuisine: "Thai",
    visitedAt: "2022-05-21",
    price: "££",
    tier: "liked",
    revisited: true,
    quote:
      "Tasty — I've been back to various Rosas Thai locations a few times since. Solid food for a decent price.",
    verdict: "Solid food, decent price. Been back to several branches since.",
    dishes: [],
    body: [
      "One of the earliest entries in the ledger and one of the most repeated — various branches, several times over the years since.",
      "Not a destination meal, and doesn't need to be. Reliable Thai at a sensible price is its own category.",
    ],
    tags: ["repeat visit"],
  },
  {
    slug: "huong-viet",
    name: "Huong Viet",
    city: "London",
    country: "UK",
    address: "94 Curtain Road, London EC2A 3AA",
    cuisine: "Vietnamese",
    visitedAt: "2022-06-09",
    price: "££",
    tier: "liked",
    revisited: true,
    quote: "Very tasty. Went as a party of 4.",
    verdict: "Very tasty. A party-of-four kind of place.",
    dishes: [],
    body: [
      "Very tasty, eaten as a group of four. There's a later booking on the calendar for 25 May 2025 as well, so this one clearly stuck.",
    ],
    tags: ["repeat visit"],
  },
  {
    slug: "manjal",
    name: "Manjal",
    city: "London",
    country: "UK",
    address: "London E14",
    cuisine: "Indian",
    visitedAt: "2022-06-11",
    price: "££",
    tier: "liked",
    quote: "Solid Indian food, for London.",
    verdict: "Solid Indian food, for London.",
    dishes: [],
    body: [
      "Solid, with the qualifier attached. Indian isn't a cuisine that gets sought out here, which makes this one a genuine exception rather than a habit.",
    ],
    tags: [],
  },
  {
    slug: "korean-bbq-house",
    name: "Korean BBQ House",
    city: "London",
    country: "UK",
    address: "London EC1Y",
    cuisine: "Korean BBQ",
    visitedAt: "2024-05-04",
    price: "££",
    tier: "liked",
    quote: "Good, tasty halal Korean BBQ. Not sure I'd revisit, but solid.",
    verdict: "Good halal Korean BBQ. Solid, if not a rebooking.",
    dishes: [],
    body: [
      "Good and tasty, and halal, which narrows the field considerably for Korean barbecue in London.",
      "Solid rather than memorable — no strong pull to return.",
    ],
    tags: ["halal"],
  },
  {
    slug: "plates-by-mick-binnington",
    name: "Plates by Mick Binnington",
    city: "Maldon",
    country: "UK",
    address: "Maldon, Essex",
    cuisine: "Modern British",
    visitedAt: "2024-11-23",
    price: "£££",
    tier: "liked",
    quote:
      "Tasty — this was the start of my fine dining journey. (Same chef I later booked a cookery-school session with.)",
    verdict: "Where the fine dining habit started.",
    dishes: [],
    body: [
      "The first one. Everything else on this site follows from this meal, which makes it more significant than its position in the rankings suggests.",
      "Enough of an impression to book a cookery-school session with the same chef later on.",
    ],
    tags: ["local", "origin story"],
  },
  {
    slug: "tabachoy",
    name: "Tabachoy",
    city: "Philadelphia",
    country: "USA",
    address: "932 S 10th St, Philadelphia, PA 19147",
    cuisine: "Filipino",
    visitedAt: "2025-04-18T19:00:00-04:00",
    price: "££",
    tier: "liked",
    quote:
      "Solid, but I wouldn't revisit this type of cuisine unless something exceptional came up — maybe I just ordered wrong.",
    verdict: "Solid. Possibly ordered wrong.",
    dishes: [],
    body: [
      "Solid, with a caveat attached — the ordering may have been the problem rather than the kitchen.",
      "Donia in London later made a stronger case for Filipino cooking than this did.",
    ],
    tags: ["dinner", "trip: NYC 2025"],
  },
  {
    slug: "little-alley",
    name: "Little Alley",
    city: "Philadelphia",
    country: "USA",
    address: null,
    cuisine: "Shanghainese",
    visitedAt: "2025-04-19T19:00:00-04:00",
    price: "££",
    tier: "liked",
    quote: "Very tasty, good price too — shame I was too full to finish.",
    verdict: "Very tasty and well priced. Arrived too full to do it justice.",
    dishes: [],
    body: [
      "Very tasty and good value. The only complaint is self-inflicted — turning up already full and not being able to finish.",
    ],
    tags: ["dinner", "trip: NYC 2025"],
  },
  {
    slug: "dinosaur-bar-b-que-harlem",
    name: "Dinosaur Bar-B-Que",
    city: "New York",
    country: "USA",
    address: "700 W 125th St, Harlem, New York, NY",
    cuisine: "American BBQ",
    visitedAt: "2025-04-20T18:45:00-04:00",
    price: "££",
    tier: "liked",
    quote: "Solid, nothing groundbreaking. Not a revisit priority.",
    verdict: "Solid, nothing groundbreaking.",
    dishes: [],
    body: [
      "Solid without doing anything unexpected. Fine as part of a trip, not a reason to plan one.",
    ],
    tags: ["dinner", "trip: NYC 2025"],
  },
  {
    slug: "the-greenway-garden-room",
    name: "The Garden Room, The Greenway Hotel & Spa",
    city: "Cheltenham",
    country: "UK",
    address: "Shurdington, Cheltenham GL51 4UG",
    cuisine: "Modern British",
    visitedAt: "2025-08-21T19:30:00+01:00",
    price: "£££",
    tier: "liked",
    quote:
      "Very good — top experience, tasty food. Part of a spa-break package, party of 2.",
    verdict: "Very good. Top experience, tasty food.",
    dishes: [],
    body: [
      "Very good on both counts — the food and the evening around it. Included in a spa-break package for two, which usually means managed expectations; not here.",
    ],
    tags: ["dinner", "trip: Cheltenham 2025"],
  },
  {
    slug: "the-coconut-tree-cheltenham",
    name: "The Coconut Tree",
    city: "Cheltenham",
    country: "UK",
    address: "59 St Paul's Road, Cheltenham GL50 4JA",
    cuisine: "Sri Lankan",
    visitedAt: "2025-08-22T19:00:00+01:00",
    price: "££",
    tier: "liked",
    quote: "Always solid, but not groundbreaking.",
    verdict: "Always solid, never groundbreaking.",
    dishes: [],
    body: [
      "Always solid — the word 'always' doing the work there, since this is a known quantity rather than a discovery.",
      "Reliable, and not trying to be more than that.",
    ],
    tags: ["dinner", "trip: Cheltenham 2025"],
  },
  {
    slug: "double-standard",
    name: "Double Standard",
    city: "London",
    country: "UK",
    address: "The Standard, 10 Argyle Street, London WC1H 8EG",
    cuisine: "American / burgers",
    visitedAt: "2025-08-30T14:00:00+01:00",
    price: "£££",
    tier: "liked",
    quote:
      "Best chicken burger I've ever had — this was the pop-up kitchen of Peking House from NYC.",
    verdict: "Best chicken burger I've ever had.",
    dishes: [
      {
        name: "Chicken burger",
        note: "Best I've ever had. Cooked by Peking House, over from New York as a pop-up.",
      },
    ],
    body: [
      "Best chicken burger to date, and the credit belongs to Peking House — the New York kitchen running the pop-up at the time rather than the venue itself.",
      "Worth noting for anyone trying to repeat the experience: the pop-up is the variable, not the address.",
    ],
    tags: ["lunch", "pop-up"],
  },
  {
    slug: "hunan",
    name: "Hunan",
    city: "London",
    country: "UK",
    address: "51 Pimlico Road, London SW1W 8NE",
    cuisine: "Chinese (Hunanese)",
    visitedAt: "2025-08-30T18:00:00+01:00",
    price: "££££",
    tier: "liked",
    quote:
      "Tasty, solid service — enjoyed not knowing what dishes were coming, but unsure I'd ever revisit.",
    verdict: "Tasty, and the no-menu format is genuinely fun. Still unsure about going back.",
    dishes: [],
    body: [
      "Tasty with solid service, and the no-menu format — dishes just arrive until you stop them — was the best part of it.",
      "Enjoyable as an experience without generating much desire to repeat it. A one-and-done, which is how most of the fine dining on this list ends up.",
    ],
    tags: ["dinner", "set menu"],
  },
  {
    slug: "casa-fofo",
    name: "Casa Fofó",
    city: "London",
    country: "UK",
    address: "158 Sandringham Road, London E8 2HS",
    cuisine: "Modern European",
    visitedAt: "2025-10-24T18:30:00+01:00",
    price: "££££",
    tier: "liked",
    quote:
      "Solid meal for the price, but the dessert let it down at the end (my sister said it was disgusting).",
    verdict: "Solid for the price, then the dessert undid it.",
    dishes: [
      {
        name: "Dessert",
        note: "Let the whole meal down. My sister's verdict was 'disgusting'.",
      },
    ],
    body: [
      "Solid value for a tasting menu at this level, right up until the last course.",
      "The dessert was the problem, and not just by my reckoning — my sister's assessment was blunter.",
    ],
    tags: ["dinner", "tasting menu", "michelin"],
  },
  {
    slug: "jiaonest",
    name: "Jiāonest",
    city: "London",
    country: "UK",
    address: "230 Kingsland Road, London E2 8AX",
    cuisine: "Sichuan",
    visitedAt: "2025-11-22T18:30:00+00:00",
    price: "£££",
    tier: "liked",
    quote: "Very good — I love Sichuan-style food, would revisit at some point.",
    verdict: "Very good. Sichuan is a weakness, and this fed it.",
    dishes: [],
    body: [
      "Very good, and squarely in a cuisine that always lands well — Sichuan cooking sits right in the bold-flavour, heat-and-depth territory that dominates the top of this list.",
      "On the revisit list, which most places here aren't.",
    ],
    tags: ["dinner", "would revisit"],
  },
  {
    slug: "heard-soho",
    name: "Heard.",
    city: "London",
    country: "UK",
    address: "31 Foubert's Place, London W1F 7QQ",
    cuisine: "Burgers",
    visitedAt: "2025-12-07T12:00:00+00:00",
    price: "£££",
    tier: "liked",
    revisited: true,
    quote: "Best burgers I've had. Already revisited since (not logged on the calendar).",
    verdict: "Best burgers I've had. Already been back.",
    dishes: [{ name: "Burger", note: "Best I've had." }],
    body: [
      "Best burgers on this list, and already revisited — which puts it in a small group. Repeat visits cluster at the casual end and this is squarely part of that pattern.",
      "Between this and Double Standard, 2025 was quietly a strong year for burgers.",
    ],
    tags: ["lunch", "repeat visit"],
  },
  {
    slug: "imads-syrian-kitchen",
    name: "Imad's Syrian Kitchen",
    city: "London",
    country: "UK",
    address: "Kingly Court, Top Floor, London W1B 5PW",
    cuisine: "Syrian",
    visitedAt: "2026-04-03T18:30:00+01:00",
    price: "£££",
    tier: "liked",
    quote: "Very tasty food, would revisit, solid price too. Party of 2.",
    verdict: "Very tasty, well priced, and on the revisit list.",
    dishes: [],
    body: [
      "Very tasty and fairly priced — a combination that shows up less often than it should on this list.",
      "One of the few places explicitly marked for a return.",
    ],
    tags: ["dinner", "would revisit"],
  },
  {
    slug: "le-george",
    name: "Le George",
    city: "Paris",
    country: "France",
    address: "Four Seasons Hôtel George V, 31 Avenue George V, 75008 Paris",
    cuisine: "Mediterranean / Italian",
    visitedAt: "2026-08-12T19:30:00+02:00",
    price: "££££",
    tier: "liked",
    quote:
      "Very tasty overall, but not sure it was worth the money. Gluten-free pasta wasn't cooked well, though the tuna truffle crudo was fine. Beef carpaccio was tasty, steak was good but not the best I've had. Service was typically French — slow, but fine. Pavlova for dessert was so good. Overall fine, but wouldn't revisit Le George itself — would rather try a tasting menu at one of the other restaurants inside the George V hotel.",
    verdict: "Very tasty, questionable value. The pavlova was the highlight.",
    dishes: [
      { name: "Tuna truffle crudo", note: "Fine." },
      { name: "Beef carpaccio", note: "Tasty." },
      { name: "Gluten-free pasta", note: "Not cooked well. The weak link." },
      { name: "Steak", note: "Good, but not the best I've had." },
      { name: "Pavlova", note: "So good. The best thing on the table." },
    ],
    body: [
      "Very tasty overall, without the bill ever quite justifying itself. The gluten-free pasta was the clear miss; the pavlova was the clear win.",
      "Service was slow in the standard French way, which was fine rather than a problem. Steak was good without troubling the best ones.",
      "Wouldn't come back to Le George specifically — but the George V has other restaurants, and a tasting menu at one of those is the more interesting way to spend the same money.",
    ],
    tags: ["dinner", "michelin", "trip: Paris 2026"],
  },
  {
    slug: "les-bistrots-fables",
    name: "Les Bistrots Fables",
    city: "Paris",
    country: "France",
    address: null,
    cuisine: "French bistro",
    visitedAt: "2026-08-15",
    price: "£££",
    tier: "liked",
    quote:
      "Typical French bistro food done well — snails, frogs' legs, steak frites, and French toast, all tasty and not too expensive. Would revisit. The steak frites is a step below Chez Rose's though.",
    verdict: "Classic bistro cooking done well, at a fair price. Would go back.",
    dishes: [
      { name: "Snails", note: "Tasty." },
      { name: "Frogs' legs", note: "Tasty." },
      { name: "Steak frites", note: "Good — a step below the version at Chez Rose." },
      { name: "French toast", note: "Tasty." },
    ],
    body: [
      "The full classic bistro run — snails, frogs' legs, steak frites, French toast — all done well and none of it overpriced.",
      "On the revisit list. The steak frites lands a step below Chez Rose's, which remains the one to beat.",
    ],
    tags: ["dinner", "trip: Paris 2026", "would revisit"],
  },

  /* ------------------------------------------------------------------ */
  /* MIXED                                                              */
  /* ------------------------------------------------------------------ */
  {
    slug: "lahpet-shoreditch",
    name: "Lahpet",
    city: "London",
    country: "UK",
    address: "58 Bethnal Green Road, London E1 6LD",
    cuisine: "Burmese",
    visitedAt: "2025-10-25T20:30:00+00:00",
    price: "£££",
    tier: "mixed",
    quote: "Fine — Burmese food, wouldn't go again, wasn't that good.",
    verdict: "Fine. Wouldn't go again.",
    dishes: [],
    body: [
      "Fine, and not much more than that. Burmese cooking is distinctive enough that it should have landed better than it did.",
      "No plans to return.",
    ],
    tags: ["dinner"],
  },

  /* ------------------------------------------------------------------ */
  /* AVOID                                                              */
  /* ------------------------------------------------------------------ */
  {
    slug: "pied-a-terre",
    name: "Pied à Terre",
    city: "London",
    country: "UK",
    address: "34 Charlotte Street, London W1T 2NH",
    cuisine: "French tasting menu",
    visitedAt: "2026-04-18T14:30:00+01:00",
    price: "££££",
    tier: "avoid",
    quote:
      "Boring food, terrible and actively disrespectful service. Treating it as a one-off bad experience — hasn't soured me on fine dining/set-menu formats generally, but I'm not going back.",
    verdict: "Boring food and actively disrespectful service. Not going back.",
    dishes: [],
    body: [
      "The worst experience on this list, and the service was the bigger problem of the two — not merely poor but actively disrespectful.",
      "The food was boring, which at this price and with this many years of a Michelin star behind it is its own kind of failure.",
      "Filed as a one-off. It hasn't put me off set menus or fine dining in general — Septime came a few months later and was the best starred meal I've had. But I won't be back here.",
    ],
    tags: ["lunch", "tasting menu", "michelin"],
  },
  {
    slug: "cocochan",
    name: "Cocochan",
    city: "London",
    country: "UK",
    address: null,
    cuisine: "Pan-Asian",
    visitedAt: "2022-06-04",
    price: null,
    tier: "avoid",
    closed: true,
    quote:
      "Not good — food was mid, music too loud, staff rude. Believe it's permanently closed now anyway.",
    verdict: "Mid food, loud music, rude staff. Since closed.",
    dishes: [],
    body: [
      "Three separate problems: the food was mid, the music was too loud, and the staff were rude.",
      "Permanently closed now, which resolves the question of whether to go back.",
    ],
    tags: ["closed"],
  },
  {
    slug: "hawksmoor-air-street",
    name: "Hawksmoor Air Street",
    city: "London",
    country: "UK",
    address: "5A Air Street, London W1J 0AD",
    cuisine: "Steakhouse",
    visitedAt: "2024-11-16",
    price: "££££",
    tier: "avoid",
    quote: "Fine, but too expensive for what it actually is.",
    verdict: "Fine, and far too expensive for what it is.",
    dishes: [],
    body: [
      "Fine food at a price that doesn't match it. The problem isn't the cooking, it's the arithmetic.",
      "Row on 5 and Chez Rose both do more interesting things at this end of the market.",
    ],
    tags: ["dinner"],
  },
  {
    slug: "long-chim",
    name: "Long Chim",
    city: "London",
    country: "UK",
    address: "36-40 Rupert Street, London W1D 6DW",
    cuisine: "Thai",
    visitedAt: "2025-06-27T18:15:00+01:00",
    price: "£££",
    tier: "avoid",
    closed: true,
    quote: "Was meh. Also permanently closed now.",
    verdict: "Meh. Since closed.",
    dishes: [],
    body: [
      "Meh — a notable miss given how well Thai food otherwise does on this list, with Singburi, Smoking Goat and Kiln all landing better.",
      "Permanently closed now.",
    ],
    tags: ["dinner", "closed"],
  },
  {
    slug: "gordon-ramsay-street-burger",
    name: "Gordon Ramsay Street Burger",
    city: "London",
    country: "UK",
    address: "The O2, Peninsula Square, London SE10 0DX",
    cuisine: "Burgers",
    visitedAt: "2025-06-19T14:00:00+01:00",
    price: "££",
    tier: "avoid",
    quote:
      "Ended up here instead of my planned Haidilao booking — bad and overpriced.",
    verdict: "Bad and overpriced. Not even where I meant to eat.",
    dishes: [],
    body: [
      "The Haidilao booking at the O2 didn't happen and this was the fallback. It was bad and overpriced.",
      "Given that Heard. and Double Standard both make the case for a good burger elsewhere in this list, there's no excuse for this one.",
    ],
    tags: ["lunch", "pre-gig"],
  },

  /* ------------------------------------------------------------------ */
  /* NO VERDICT LOGGED                                                  */
  /* ------------------------------------------------------------------ */
  {
    slug: "dear-irving-on-hudson",
    name: "Dear Irving on Hudson",
    city: "New York",
    country: "USA",
    address: "Hotel Henri Rooftop, 138 W 32nd St, New York, NY",
    cuisine: "Cocktail bar",
    visitedAt: "2025-04-20T21:15:00-04:00",
    price: null,
    tier: "unlogged",
    quote: null,
    verdict: "Rooftop bar on the last night in New York. Nothing written down.",
    dishes: [],
    body: [
      "In the calendar for the final night of the New York trip, with no verdict recorded anywhere.",
    ],
    tags: ["drinks", "trip: NYC 2025"],
    needsCheck: "No verdict logged — worth writing one while it's still recallable.",
  },
  {
    slug: "arcade-food-hall",
    name: "Arcade Food Hall",
    city: "London",
    country: "UK",
    address: "Centre Point, 103-105 New Oxford Street, London WC1A 1DB",
    cuisine: "Food hall",
    visitedAt: "2023-01-28",
    price: null,
    tier: "unlogged",
    quote: null,
    verdict: "Party of five, confirmed booking, no opinion recorded.",
    dishes: [],
    body: [
      "A confirmed reservation for five and nothing else — no note on which counters were eaten from or whether any of it was any good.",
    ],
    tags: [],
    needsCheck: "No verdict logged. Which stalls did you eat at?",
  },
  {
    slug: "eorzea-cafe",
    name: "Final Fantasy Eorzea Cafe",
    city: "Tokyo",
    country: "Japan",
    address: "Akihabara, Tokyo",
    cuisine: "Themed cafe",
    visitedAt: "2023-04-18",
    price: null,
    tier: "unlogged",
    quote: null,
    verdict: "Akihabara, 2023. Booked, visited, never written up.",
    dishes: [],
    body: [
      "The only Japan entry in the ledger so far, and the only themed cafe. No verdict was ever recorded.",
    ],
    tags: ["trip: Tokyo 2023"],
    needsCheck: "No verdict logged — and the only Tokyo entry on the site.",
  },
  {
    slug: "chez-ann-echiquier",
    name: "Chez Ann Échiquier",
    city: "Paris",
    country: "France",
    address: "29 Rue de l'Échiquier, 75010 Paris",
    cuisine: "French bistro",
    visitedAt: "2026-08-14T18:00:00+02:00",
    price: null,
    tier: "unlogged",
    quote: null,
    verdict: "Booked for the Friday of the Paris trip. Unconfirmed whether it happened.",
    dishes: [],
    body: [
      "On the Paris itinerary and in the calendar, but absent from the verdict ledger — so it's unclear whether the meal actually happened.",
    ],
    tags: ["trip: Paris 2026"],
    needsCheck:
      "Ledger gap: did this happen? Same question for Maison Rostang (Thu 13 Aug) and Café 52, which was swapped out for Les Bistrots Fables.",
  },
];

export type WishlistItem = {
  name: string;
  city: string;
  note: string;
  plannedFor?: string;
};

/** Booked or planned, not yet visited. */
export const wishlist: WishlistItem[] = [
  {
    name: "The Fat Duck",
    city: "Bray",
    plannedFor: "2028-11-17",
    note: "The anchor trip. Dinner, wine pairing and an overnight stay because driving afterwards is not happening.",
  },
  {
    name: "Restaurant JOURNEY",
    city: "—",
    note: "Booked ahead. Not been yet.",
  },
  {
    name: "Plénitude",
    city: "Paris",
    note: "Booked ahead. Not been yet.",
  },
  {
    name: "CORE",
    city: "London",
    note: "Booked ahead. Not been yet.",
  },
];
