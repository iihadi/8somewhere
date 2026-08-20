export type Dish = {
  name: string;
  note: string;
};

export type Review = {
  /** URL segment. Also the folder name under /public/photos/<slug>/ */
  slug: string;
  name: string;
  city: string;
  country: string;
  address: string;
  cuisine: string;
  /** ISO timestamp of the visit, taken from the calendar entry */
  visitedAt: string;
  /** £ – ££££ */
  price: string;
  /** out of 10, one decimal */
  rating: number;
  /** One-line pull quote shown on cards */
  verdict: string;
  dishes: Dish[];
  /** Each string is a paragraph */
  body: string[];
  tags: string[];
  /** true = auto-generated placeholder copy, not yet written by you */
  draft: boolean;
};

/**
 * Reviews are seeded from Google Calendar reservations.
 * Everything marked `draft: true` has PLACEHOLDER prose — rewrite the
 * `body`, `dishes`, `verdict` and `rating` fields with your real thoughts,
 * then flip `draft` to false to drop the "Draft" badge.
 */
export const reviews: Review[] = [
  {
    slug: "tabachoy",
    name: "Tabachoy",
    city: "Philadelphia",
    country: "USA",
    address: "932 S 10th St, Philadelphia, PA 19147",
    cuisine: "Filipino",
    visitedAt: "2025-04-18T19:00:00-04:00",
    price: "££",
    rating: 8.4,
    verdict: "Filipino comfort food with none of the edges sanded off.",
    dishes: [
      { name: "Lumpia", note: "Blistered, shattering, gone in about forty seconds." },
      { name: "Adobo", note: "Darker and more vinegar-forward than most versions here." },
      { name: "Halo-halo", note: "Ridiculous in the best way." },
    ],
    body: [
      "First stop of the trip and a good omen for the rest of it. Tabachoy sits on a quiet stretch of South 10th and looks like nothing much from the pavement — which is usually a sign.",
      "The kitchen is not interested in translating Filipino food for anyone. The sourness stays sour, the funk stays funky, and the whole table is better for it. Service was quick and genuinely warm even on a full Friday.",
      "Would go back without thinking about it. Worth planning a detour for if you're anywhere near the neighbourhood.",
    ],
    tags: ["dinner", "trip: NYC 2025"],
    draft: true,
  },
  {
    slug: "little-alley",
    name: "Little Alley",
    city: "New York",
    country: "USA",
    address: "550 3rd Ave, New York, NY",
    cuisine: "Shanghainese",
    visitedAt: "2025-04-19T19:00:00-04:00",
    price: "££",
    rating: 8.0,
    verdict: "Shanghainese done properly, in a room that doesn't shout about it.",
    dishes: [
      { name: "Xiao long bao", note: "Thin skins, held their soup all the way to the spoon." },
      { name: "Braised pork belly", note: "Sweet, glossy, dangerously easy to over-order." },
      { name: "Scallion oil noodles", note: "The dish I'd come back for on its own." },
    ],
    body: [
      "Booked on a recommendation and it delivered. Little Alley is the kind of place that gets the fundamentals right rather than chasing anything clever.",
      "The red-braised dishes are the reason to be here — deep, sweet-savoury, slightly sticky. We over-ordered, which is the correct way to eat here anyway.",
      "Quietly one of the best value meals of the trip.",
    ],
    tags: ["dinner", "trip: NYC 2025"],
    draft: true,
  },
  {
    slug: "8282",
    name: "8282",
    city: "New York",
    country: "USA",
    address: "141 1st Ave, New York, NY",
    cuisine: "Korean",
    visitedAt: "2025-04-19T20:00:00-04:00",
    price: "£££",
    rating: 8.6,
    verdict: "Korean barbecue with a bar programme that actually earns its place.",
    dishes: [
      { name: "Galbi", note: "Marinated hard and grilled harder. Excellent char." },
      { name: "Banchan spread", note: "Generous and constantly topped up." },
      { name: "Corn cheese", note: "No notes. Perfect as always." },
    ],
    body: [
      "East Village KBBQ that feels more like a proper restaurant than a smoke-filled grill house. Low light, good music, staff who know exactly when to step in and turn the meat.",
      "The cuts were better than the price suggested and the marinades leaned savoury rather than sugary. Cocktails were a genuine step up from the usual soju-and-beer default.",
      "The busiest table of the trip in the best sense — everyone talking over each other with tongs in hand.",
    ],
    tags: ["dinner", "trip: NYC 2025"],
    draft: true,
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
    rating: 7.6,
    verdict: "A proper barn of a barbecue joint. Come hungry, leave slowly.",
    dishes: [
      { name: "Brisket", note: "Good bark, and it didn't need the sauce." },
      { name: "Ribs", note: "Tender without falling apart — the right side of the line." },
      { name: "Mac and cheese", note: "Exactly as heavy as it should be." },
    ],
    body: [
      "Loud, busy, unapologetically a barbecue hall. The queue moved quickly and the room has genuine character rather than manufactured roadhouse styling.",
      "Brisket was the pick of the meats. The sides do most of the damage — order fewer than you think you need.",
      "Not a subtle meal, and it isn't trying to be. Worth the trip up to 125th.",
    ],
    tags: ["dinner", "trip: NYC 2025"],
    draft: true,
  },
  {
    slug: "dear-irving-on-hudson",
    name: "Dear Irving on Hudson",
    city: "New York",
    country: "USA",
    address: "Hotel Henri Rooftop, 138 W 32nd St, New York, NY",
    cuisine: "Cocktail bar",
    visitedAt: "2025-04-20T21:15:00-04:00",
    price: "£££",
    rating: 8.2,
    verdict: "A rooftop that's about the drinks first and the skyline second.",
    dishes: [
      { name: "House martini", note: "Cold, precise, correct." },
      { name: "Seasonal sour", note: "Balanced rather than sweet. Well judged." },
      { name: "Bar snacks", note: "Fine — you're not here for these." },
    ],
    body: [
      "Last night of the trip, spent looking at the Empire State Building through a glass. The room is styled to within an inch of its life but the bartending is serious.",
      "Drinks arrived quickly for a packed rooftop and nothing was over-sweetened, which is more than most places at this altitude manage.",
      "Book ahead. Standing room here is not the same experience.",
    ],
    tags: ["drinks", "trip: NYC 2025"],
    draft: true,
  },
  {
    slug: "huong-viet",
    name: "Huong Viet",
    city: "London",
    country: "UK",
    address: "94 Curtain Road, London EC2A 3AA",
    cuisine: "Vietnamese",
    visitedAt: "2025-05-25T14:30:00+01:00",
    price: "££",
    rating: 7.8,
    verdict: "Reliable Shoreditch Vietnamese — the sort of place you end up at twice a year.",
    dishes: [
      { name: "Pho bo", note: "Clean broth, properly aromatic." },
      { name: "Bun cha", note: "Good char on the pork, herbs plentiful." },
      { name: "Summer rolls", note: "Fresh, if unremarkable." },
    ],
    body: [
      "A post-Comic Con lunch that did exactly what was needed. Huong Viet has been on Curtain Road long enough to have stopped trying to impress anyone, which suits it.",
      "The broth is the tell — clear, long-simmered, no shortcuts. Everything else on the menu is solid without being a destination.",
      "Good value, quick turnaround, no fuss.",
    ],
    tags: ["lunch"],
    draft: true,
  },
  {
    slug: "haidilao-o2",
    name: "Haidilao",
    city: "London",
    country: "UK",
    address: "The O2, Peninsula Square, London SE10 0DX",
    cuisine: "Chinese hotpot",
    visitedAt: "2025-06-19T14:00:00+01:00",
    price: "££",
    rating: 8.1,
    verdict: "The service is the show. The hotpot is very good too.",
    dishes: [
      { name: "Split broth (mala / tomato)", note: "Mala had real numbing depth." },
      { name: "Hand-pulled noodles", note: "Made at the table. Still a good bit of theatre." },
      { name: "Beef slices", note: "Thin, fast-cooking, exactly right." },
    ],
    body: [
      "Pre-gig hotpot before Ado at the O2. Haidilao's whole thing is the hospitality — free snacks, drinks topped up constantly, someone appearing the moment you look around.",
      "The mala broth is genuinely hot rather than performatively so, and the dipping-sauce bar means everyone builds their own thing. Two hours disappeared without noticing.",
      "Ideal before an arena show — you leave full and slightly over-caffeinated on tea.",
    ],
    tags: ["lunch", "pre-gig"],
    draft: true,
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
    rating: 8.0,
    verdict: "Bangkok street food with the heat left in.",
    dishes: [
      { name: "Chiang Mai larb", note: "Serious chilli, serious herbs." },
      { name: "Southern curry", note: "The most aggressive dish on the table. Loved it." },
      { name: "Pad thai", note: "Better than it needs to be." },
    ],
    body: [
      "David Thompson's Soho outpost, and it doesn't do the usual London trick of dialling the spice down for the room. The southern curry in particular does not negotiate.",
      "Basement room, dark, loud, good energy. Service was quick even on a Friday.",
      "Not cheap for Thai food, but the cooking justifies it.",
    ],
    tags: ["dinner"],
    draft: true,
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
    rating: 7.4,
    verdict: "Country-house dining doing precisely what country-house dining should.",
    dishes: [
      { name: "Starter", note: "Neat, classical, well seasoned." },
      { name: "Main", note: "Generous, traditional, safe." },
      { name: "Dessert", note: "The strongest course of the three." },
    ],
    body: [
      "Included with the spa break, and better than the phrase 'included with the spa break' usually implies. Three courses in a conservatory dining room looking over the grounds.",
      "The cooking is classical and unhurried rather than exciting. Nothing was mis-seasoned and nothing surprised us either — for the setting, that's about right.",
      "Go for the room and the pace of the evening.",
    ],
    tags: ["dinner", "trip: Cheltenham 2025"],
    draft: true,
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
    rating: 8.3,
    verdict: "Sri Lankan small plates and arrack cocktails. Enormous fun.",
    dishes: [
      { name: "Hoppers", note: "Crisp edges, soft centre, egg in the middle. Order two." },
      { name: "Devilled chicken", note: "Sticky, sharp, hot. Best thing on the table." },
      { name: "Coconut sambol", note: "Goes on everything." },
    ],
    body: [
      "The original Coconut Tree site, and it has the atmosphere the chain has been trying to bottle ever since. Loud, cheap-ish, extremely good natured.",
      "Small plates come out in whatever order they're ready, which keeps things moving. The devilled dishes are where the kitchen shows off.",
      "Best meal of the Cheltenham trip by some margin.",
    ],
    tags: ["dinner", "trip: Cheltenham 2025"],
    draft: true,
  },
  {
    slug: "double-standard",
    name: "Double Standard",
    city: "London",
    country: "UK",
    address: "The Standard, 10 Argyle Street, London WC1H 8EG",
    cuisine: "Bar / American",
    visitedAt: "2025-08-30T14:00:00+01:00",
    price: "£££",
    rating: 7.2,
    verdict: "A beautiful room doing decent bar food at hotel prices.",
    dishes: [
      { name: "Burger", note: "Solid. Not the reason to come." },
      { name: "Fries", note: "Very good, to be fair." },
      { name: "Cocktails", note: "Well made, priced accordingly." },
    ],
    body: [
      "The ground-floor bar at The Standard, which is a genuinely lovely space — all curves, warm wood and King's Cross people-watching.",
      "The food is fine rather than memorable. You're paying for the room and the address, and on a sunny afternoon that's a trade worth making once.",
      "Come for a drink and a snack, eat properly elsewhere.",
    ],
    tags: ["lunch", "drinks"],
    draft: true,
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
    rating: 9.0,
    verdict: "You don't order. You just keep saying yes. One of the great London meals.",
    dishes: [
      { name: "The parade of small dishes", note: "A dozen-plus courses, no menu, no repeats." },
      { name: "Bamboo cup soup", note: "The signature, and deservedly so." },
      { name: "Chilli-heavy plates midway", note: "Where the meal properly wakes up." },
    ],
    body: [
      "No menu. You state what you don't eat and how much heat you want, and the kitchen sends out course after course until you surrender. It's a format almost nobody else in London commits to this hard.",
      "The rhythm is the point — small, sharp, varied plates that keep resetting your palate. Some are delicate, some are properly fiery, and none of them outstay their welcome.",
      "Expensive, and worth it. The kind of meal you talk about for months afterwards.",
    ],
    tags: ["dinner", "special occasion"],
    draft: true,
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
    rating: 8.5,
    verdict: "Modern Korean cooking in Hackney with real confidence.",
    dishes: [
      { name: "Kimchi jeon", note: "Lacy, crisp, sharp." },
      { name: "Braised short rib", note: "Falls apart, deeply savoury." },
      { name: "Seasonal banchan", note: "Thoughtful rather than filler." },
    ],
    body: [
      "Miga is doing something more considered than the usual London Korean template — smaller plates, sharper seasoning, a wine list that's clearly been thought about.",
      "Everything arrived hot and quickly, and the room has that Mare Street energy without being deafening.",
      "Easy recommendation for east London. Book, though.",
    ],
    tags: ["dinner"],
    draft: true,
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
    rating: 9.2,
    verdict: "Worth every bit of the hype. The best Thai food I've eaten in this country.",
    dishes: [
      { name: "Southern-style curry", note: "Enormous depth, genuine heat." },
      { name: "Crab omelette", note: "Loose, rich, absurd." },
      { name: "Whatever's on the specials board", note: "Always order from it." },
    ],
    body: [
      "The Leytonstone legend, reborn in Shoreditch. The specials board is still where the real cooking lives and the kitchen still cooks with no interest in making things easy.",
      "Heat, funk, sourness, sweetness — all cranked up and somehow held in balance. The kind of food that rearranges what you thought a dish was supposed to taste like.",
      "Getting a table is the hard part. Everything after that is straightforward.",
    ],
    tags: ["lunch", "favourite"],
    draft: true,
  },
  {
    slug: "casa-fofo",
    name: "Casa Fofó",
    city: "London",
    country: "UK",
    address: "158 Sandringham Road, London E8 2HS",
    cuisine: "Modern European tasting menu",
    visitedAt: "2025-10-24T18:30:00+01:00",
    price: "££££",
    rating: 8.8,
    verdict: "Fermentation-heavy tasting menu in a tiny Dalston room. Quietly brilliant.",
    dishes: [
      { name: "Opening snacks", note: "Sharp, fermented, immediately sets the tone." },
      { name: "Fish course", note: "Best plate of the night." },
      { name: "Dessert", note: "Restrained. Barely sweet. Excellent." },
    ],
    body: [
      "A tasting menu in a room that seats not many people, with an open kitchen a couple of feet from the table. The cooking leans hard on ferments and preserves, and it works.",
      "Wine pairings were confident and a little unusual, which is what you want here. Service is chatty without being intrusive.",
      "The Michelin star it picked up made complete sense from the first snack onwards.",
    ],
    tags: ["dinner", "tasting menu", "michelin"],
    draft: true,
  },
  {
    slug: "lahpet-shoreditch",
    name: "Lahpet",
    city: "London",
    country: "UK",
    address: "58 Bethnal Green Road, London E1 6LD",
    cuisine: "Burmese",
    visitedAt: "2025-10-25T20:30:00+00:00",
    price: "£££",
    rating: 8.4,
    verdict: "Burmese food that makes you wonder why there isn't more of it in London.",
    dishes: [
      { name: "Tea leaf salad", note: "Textural, funky, addictive. The signature for a reason." },
      { name: "Pork belly curry", note: "Rich and slow-cooked." },
      { name: "Shan noodles", note: "Comforting and properly savoury." },
    ],
    body: [
      "Late booking after a long Comic Con day and it revived everyone at the table. The tea leaf salad is the gateway dish — crunchy, sour, savoury, unlike anything else.",
      "The curries are gentler than the Thai equivalents but no less deep. Room is smart without being stiff.",
      "One of the more distinctive cuisines in the city and Lahpet makes a strong case for it.",
    ],
    tags: ["dinner"],
    draft: true,
  },
  {
    slug: "jiaonest",
    name: "Jiāonest",
    city: "London",
    country: "UK",
    address: "230 Kingsland Road, London E2 8AX",
    cuisine: "Chinese",
    visitedAt: "2025-11-22T18:30:00+00:00",
    price: "£££",
    rating: 8.3,
    verdict: "Dumplings as the main event, and they hold up to the billing.",
    dishes: [
      { name: "Pork and prawn dumplings", note: "Thin skins, properly juicy." },
      { name: "Chilli oil wontons", note: "The chilli oil is the whole argument." },
      { name: "Cold starters", note: "Sharp and refreshing between the heavier plates." },
    ],
    body: [
      "A narrow Kingsland Road room built around one idea done carefully. The wrappers are made in-house and it shows in the bite.",
      "Ordering is easy — a couple of cold plates, a lot of dumplings, and something with chilli oil on it. The kitchen doesn't waste anything on things it isn't good at.",
      "Good for a Saturday evening that doesn't need to be an event.",
    ],
    tags: ["dinner"],
    draft: true,
  },
  {
    slug: "heard-soho",
    name: "Heard.",
    city: "London",
    country: "UK",
    address: "31 Foubert's Place, London W1F 7QQ",
    cuisine: "Modern European",
    visitedAt: "2025-12-07T12:00:00+00:00",
    price: "£££",
    rating: 8.0,
    verdict: "A tight Soho menu executed with more precision than the room lets on.",
    dishes: [
      { name: "Bread and butter", note: "Charge for it — I don't mind when it's this good." },
      { name: "Fish main", note: "Cleanly cooked, well judged sauce." },
      { name: "Side of greens", note: "Not an afterthought, which is rare." },
    ],
    body: [
      "Lunch before meeting Will. Small menu, mostly seasonal, changing often enough that it's clearly not sitting still.",
      "Nothing was showy. Everything was seasoned properly and arrived at the right temperature, which sounds like faint praise and absolutely isn't.",
      "A good, sane Soho lunch option in an area with plenty of bad ones.",
    ],
    tags: ["lunch"],
    draft: true,
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
    rating: 8.7,
    verdict: "Generous, warm, personal cooking. Hard not to love it.",
    dishes: [
      { name: "Muhammara", note: "Smoky, nutty, gone quickly." },
      { name: "Lamb shawarma", note: "Tender and heavily spiced." },
      { name: "Fattoush", note: "Sharp enough to cut through everything else." },
    ],
    body: [
      "Top floor of Kingly Court, and the story behind the place is genuinely part of the experience — the hospitality here isn't a front-of-house policy, it's the point.",
      "Mezze first, and order more of them than you plan to. The lamb dishes are excellent but the small plates are where the personality is.",
      "One of the friendliest rooms in central London.",
    ],
    tags: ["dinner"],
    draft: true,
  },
  {
    slug: "oma",
    name: "OMA",
    city: "London",
    country: "UK",
    address: "2-4 Bedale Street, London SE1 9AL",
    cuisine: "Greek / Eastern Mediterranean",
    visitedAt: "2026-04-04T15:00:00+01:00",
    price: "££££",
    rating: 9.0,
    verdict: "Raw fish, fire and a Borough Market view. Effortlessly excellent.",
    dishes: [
      { name: "Raw fish plates", note: "Immaculate quality, barely touched. Correct." },
      { name: "Grilled whole fish", note: "Charred skin, perfect flesh." },
      { name: "Tomato salad", note: "Three ingredients, no hiding place, flawless." },
    ],
    body: [
      "Upstairs at OMA above Agora, overlooking Borough Market. The room is bright and stone-heavy and the cooking is confident enough to leave things almost entirely alone.",
      "The raw section is the reason to book. After that it's fire — whole fish, grilled vegetables, everything smoky and simply dressed.",
      "Expensive, but this is as good as this style of cooking gets in London right now.",
    ],
    tags: ["lunch", "favourite"],
    draft: true,
  },
  {
    slug: "pied-a-terre",
    name: "Pied à Terre",
    city: "London",
    country: "UK",
    address: "34 Charlotte Street, London W1T 2NH",
    cuisine: "French tasting menu",
    visitedAt: "2026-04-18T14:30:00+01:00",
    price: "££££",
    rating: 8.9,
    verdict: "London's longest-standing Michelin star, and it still knows exactly what it's doing.",
    dishes: [
      { name: "Amuse-bouche run", note: "Classical technique, no gimmicks." },
      { name: "Fish course", note: "Precise sauce work — the house strength." },
      { name: "Cheese trolley", note: "Say yes. Always say yes." },
    ],
    body: [
      "Open since 1991 and holding a star for most of that, which in London is close to a miracle. The Fitzrovia townhouse dining room is elegant without being austere.",
      "French technique with light Asian seasoning running underneath it. The sauces are the thing — long-reduced, glossy, and doing most of the heavy lifting.",
      "The three-course lunch menu is the smart way in. Service is informed and relaxed rather than ceremonial.",
    ],
    tags: ["lunch", "tasting menu", "michelin"],
    draft: true,
  },
  {
    slug: "row-on-5",
    name: "Row on 5",
    city: "London",
    country: "UK",
    address: "5 Savile Row, London W1S 3PB",
    cuisine: "Modern British",
    visitedAt: "2026-05-15T18:30:00+01:00",
    price: "££££",
    rating: 8.2,
    verdict: "Savile Row tailoring applied to a menu. Sharp, expensive, well cut.",
    dishes: [
      { name: "Opening snacks", note: "Fussy in a good way." },
      { name: "Beef course", note: "Excellent sourcing, restrained treatment." },
      { name: "Dessert", note: "Technically impressive." },
    ],
    body: [
      "A handsome room in a handsome part of town, and the cooking matches the address — polished, precise, and priced for Mayfair.",
      "Ingredient quality is the headline and the kitchen mostly gets out of its way. A couple of plates tipped slightly into over-composition, but nothing missed.",
      "Occasion dining rather than a regular. Worth it for the right night.",
    ],
    tags: ["dinner", "special occasion"],
    draft: true,
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
    rating: 8.6,
    verdict: "Modern Filipino cooking that doesn't apologise for a single flavour.",
    dishes: [
      { name: "Kinilaw", note: "Sharp, coconut-rich, brilliant opener." },
      { name: "Crispy pata", note: "Shattering skin. Ridiculous." },
      { name: "Ube dessert", note: "Less sweet than expected. Better for it." },
    ],
    body: [
      "Kingly Court again, different floor, entirely different mood. Donia takes Filipino flavours and gives them restaurant polish without sanding down the vinegar and funk.",
      "The sour dishes are the strongest — kinilaw and adobo variations that stay properly acidic. Cocktails lean tropical and are well made.",
      "Second Filipino meal on this site and both are among the best things I've eaten in Soho.",
    ],
    tags: ["dinner"],
    draft: true,
  },
  {
    slug: "anglothai",
    name: "AngloThai",
    city: "London",
    country: "UK",
    address: "22-24 Seymour Place, London W1H 7NL",
    cuisine: "Thai / British",
    visitedAt: "2026-06-06T12:00:00+01:00",
    price: "££££",
    rating: 8.8,
    verdict: "British produce, Thai technique. A genuinely original restaurant.",
    dishes: [
      { name: "Relish course", note: "Sharp, salty, sets everything up." },
      { name: "Curry with UK-sourced protein", note: "The whole idea in one bowl." },
      { name: "Grilled vegetables", note: "Smoke and heat, beautifully judged." },
    ],
    body: [
      "The premise — Thai cooking built entirely on British seasonal ingredients — could easily be a gimmick. It isn't. The curry pastes are made properly and the produce genuinely benefits from the treatment.",
      "Lunch is the calmer way to experience it. The kitchen is precise and the heat is real rather than suggested.",
      "Among the most interesting things happening in London cooking right now.",
    ],
    tags: ["lunch", "tasting menu"],
    draft: true,
  },
  {
    slug: "chez-rose",
    name: "Chez Rose",
    city: "London",
    country: "UK",
    address: "5 Pollen Street, London W1S 1NE",
    cuisine: "French",
    visitedAt: "2026-06-20T18:00:00+01:00",
    price: "££££",
    rating: 8.1,
    verdict: "A proper French room in Mayfair. Classical, buttery, unbothered by trends.",
    dishes: [
      { name: "Starter", note: "Classical and generous." },
      { name: "Main with sauce", note: "The sauce is the reason you're here." },
      { name: "Dessert trolley", note: "Old-fashioned in the best sense." },
    ],
    body: [
      "Pollen Street is quietly becoming a very good street to eat on, and Chez Rose leans fully into French bistro-luxe rather than chasing anything current.",
      "Butter, cream, reduction — the classic toolkit, handled well. Not a light meal and not pretending to be.",
      "Comfortable, expensive, satisfying.",
    ],
    tags: ["dinner"],
    draft: true,
  },
  {
    slug: "osteria-angelina",
    name: "Osteria Angelina",
    city: "London",
    country: "UK",
    address: "1 Nicholls & Clarke Yard, London E1 6JN",
    cuisine: "Italian / Asian",
    visitedAt: "2026-07-08T14:30:00+01:00",
    price: "£££",
    rating: 8.4,
    verdict: "Italian-Asian crossover that has no business working as well as it does.",
    dishes: [
      { name: "Handmade pasta", note: "Perfect texture, unexpected seasoning." },
      { name: "Raw fish plate", note: "Where the two cuisines meet most convincingly." },
      { name: "Tiramisu variation", note: "Familiar shape, different flavour. Worked." },
    ],
    body: [
      "The osteria sibling of Angelina, in a Shoreditch yard that's easy to walk past. The premise is Italian technique with Japanese seasoning and it's handled with restraint rather than as a novelty.",
      "Pasta is made in-house and cooked properly. The dashi-adjacent sauces sound wrong on paper and taste obvious in the bowl.",
      "Great value at lunch. One of my favourite ideas in east London.",
    ],
    tags: ["lunch"],
    draft: true,
  },
  {
    slug: "le-george",
    name: "Le George — Four Seasons Hôtel George V",
    city: "Paris",
    country: "France",
    address: "31 Avenue George V, 75008 Paris",
    cuisine: "Mediterranean / Italian",
    visitedAt: "2026-08-12T19:30:00+02:00",
    price: "££££",
    rating: 8.7,
    verdict: "Michelin-starred Mediterranean under the George V's flower arrangements.",
    dishes: [
      { name: "Crudo", note: "Immaculate produce, barely dressed." },
      { name: "Pasta course", note: "Delicate and precisely seasoned." },
      { name: "Dessert", note: "Beautiful. Slightly upstaged by the room." },
    ],
    body: [
      "First night in Paris and a deliberately grand start. The George V's floral displays are genuinely a spectacle and Le George sits right in the middle of them.",
      "The cooking is Mediterranean and lighter than the setting suggests — crudo, pasta, vegetables, all handled with a star-level lightness of touch.",
      "Extremely expensive, entirely memorable. Worth doing once.",
    ],
    tags: ["dinner", "michelin", "trip: Paris 2026"],
    draft: true,
  },
  {
    slug: "septime",
    name: "Septime",
    city: "Paris",
    country: "France",
    address: "80 Rue de Charonne, 75011 Paris",
    cuisine: "Modern French tasting menu",
    visitedAt: "2026-08-13T19:00:00+02:00",
    price: "££££",
    rating: 9.3,
    verdict: "The best meal of the Paris trip, and possibly of the year.",
    dishes: [
      { name: "Vegetable opener", note: "Made a case for vegetables as the main event." },
      { name: "Fish course", note: "Perfectly cooked, sauce doing everything." },
      { name: "Dairy-led dessert", note: "Barely sweet, completely right." },
    ],
    body: [
      "Notoriously hard to book and worth the effort. The room is warm wood and low key, with none of the formality the reputation might suggest.",
      "The menu is short, seasonal and almost entirely led by produce. Each course is simple to describe and impossible to fault — the sort of restraint that takes far more skill than complexity does.",
      "Wine pairings were natural-leaning and confidently chosen. Everything about the evening was judged perfectly.",
    ],
    tags: ["dinner", "tasting menu", "michelin", "favourite", "trip: Paris 2026"],
    draft: true,
  },
  {
    slug: "chez-ann-echiquier",
    name: "Chez Ann Échiquier",
    city: "Paris",
    country: "France",
    address: "29 Rue de l'Échiquier, 75010 Paris",
    cuisine: "French bistro",
    visitedAt: "2026-08-14T18:00:00+02:00",
    price: "£££",
    rating: 8.0,
    verdict: "A relaxed neighbourhood bistro to land in after a week of big meals.",
    dishes: [
      { name: "Charcuterie", note: "Good sourcing, nothing overthought." },
      { name: "Main of the day", note: "Honest, generous, correctly seasoned." },
      { name: "House wine", note: "Better than most places' list." },
    ],
    body: [
      "Last dinner of the trip, deliberately low-key. The 10th arrondissement does this kind of place better than almost anywhere.",
      "Short menu, no ceremony, the sort of cooking that doesn't need explaining. Exactly the right note to end on.",
      "The kind of restaurant you'd have as a local and never bother reviewing — which is usually the highest compliment.",
    ],
    tags: ["dinner", "trip: Paris 2026"],
    draft: true,
  },
];

export type WishlistItem = {
  name: string;
  city: string;
  note: string;
  plannedFor?: string;
};

/** Booked or planned, not yet visited. Sourced from the calendar too. */
export const wishlist: WishlistItem[] = [
  {
    name: "The Fat Duck",
    city: "Bray",
    plannedFor: "2028-11-17",
    note: "The anchor trip. Dinner, wine pairing and an overnight stay because driving afterwards is not happening.",
  },
];

/* ------------------------------------------------------------------ */
/* Derived helpers                                                    */
/* ------------------------------------------------------------------ */

export const reviewsByDate = [...reviews].sort(
  (a, b) => +new Date(b.visitedAt) - +new Date(a.visitedAt)
);

export function getReview(slug: string) {
  return reviews.find((r) => r.slug === slug);
}

export const cities = Array.from(new Set(reviews.map((r) => r.city))).sort();
export const cuisines = Array.from(new Set(reviews.map((r) => r.cuisine))).sort();

export const stats = {
  total: reviews.length,
  cities: cities.length,
  countries: new Set(reviews.map((r) => r.country)).size,
  average:
    Math.round(
      (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
    ) / 10,
  top: [...reviews].sort((a, b) => b.rating - a.rating)[0],
};
