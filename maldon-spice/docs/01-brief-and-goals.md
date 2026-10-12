# 01. Brief and goals

## Business
Maldon Spice is a family-run Indian restaurant on Maldon High Street, run by Jhual and Shamema, who describe themselves as award-winning restaurateurs with over 30 years of experience. Open Tuesday to Sunday, 17:00 to 22:00. Dine-in plus **collection only** takeaway (no delivery). Ordering, booking and the till are in **Mobi POS** (mobi-pos.com).

## Why rebuild
Findings from reviewing the live site on 12 October 2026:
- H1 is literally "Homepage". Page titles and meta descriptions are generic or keyword-stuffed.
- Order and Book on the homepage are bare headings; clicking Order did nothing in testing (possibly a broken widget).
- Stale "Christmas and New Year 2025/26" hours still live, with a typo ("Sun 30th – Sun 7th December").
- Menus are four PDFs, so dishes and allergens are not indexable and are hard to use on a phone. One PDF contains the guest Wi-Fi password.
- Twenty Twenty theme plus Elementor, Kadence Blocks and Otter Blocks, Smart Slider, a3 Lazy Load, Autoptimize, Custom Facebook Feed, Google reviews widget, WPForms Lite, MonsterInsights, AIOSEO, an ordering plugin. About 171 requests on load (includes admin-bar assets).
- 22 of 41 images have no alt text. Press-photo slider includes at least one image with a faint agency watermark (check rights).
- Google reviews widget shows only 4 to 5 year old reviews, including one that mentions old decor and one defending against an unseen accusation.

## Goals, in priority order
1. Visitors can find hours, address, parking, phone and the menu within one screen and two taps.
2. Reserve and Order for collection are always one tap away, on every page and viewport.
3. People with allergies and dietary needs can check dishes quickly (allergen filter, dairy-free menu, vegan specials) and are always told to speak to staff.
4. Rank for local searches: "Indian restaurant Maldon", "curry Maldon", "dairy free Indian Maldon", "vegan Indian Maldon Essex", "takeaway Maldon".
5. Fast and stable on a mid-range phone on 4G.
6. Easy for the family to keep correct: hours, closures and a notice banner come from one small file; prices and dishes come from one data file.

## Non-goals
Online payments, delivery, accounts, a blog, a CMS login for the family in v1, third-party review widgets, social feeds, chatbots, popups.

## Success measures
Lighthouse mobile 95+, LCP under 2.0 s, zero layout shift, Google Business Profile clicks to Call / Order / Reserve tracked (GBP insights), Search Console impressions for the local queries above, no allergen data errors.
