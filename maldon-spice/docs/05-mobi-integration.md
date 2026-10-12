# 05. Mobi POS integration

Mobi POS (mobi-pos.com) is the restaurant's till and already used internally for order taking. The website **links to** Mobi for ordering and booking. It does not embed a payment flow, store orders, or call Mobi APIs.

## What Mobi advertises (from mobi-pos.com, checked 12 October 2026)
- **Online Ordering** module: collection and delivery, table QR ordering, pre-orders, online payments (optional), a generated branded ordering site on a Mobi subdomain, **custom domain with SSL**, products sync both ways between POS and cloud, items can be hidden per ordering method. Requires POS + CloudSync + Online Ordering licences. Accepted orders print straight to the kitchen printer. Staff accept or reject orders in the POS and reply with a preparation time.
- **Online Booking** module: bookings sync between the website and the POS, confirmation and reminder emails, embeddable booking page, Google integration, no online deposits. Requires POS + CloudSync + Online Booking licences.
- Public prices (USD, annual billing): POS $10, CloudSync $12, Online Ordering $15, Online Booking $12 per month, plus extra terminals. Minimum plan duration 3 months, no refunds. Confirm what the restaurant already pays for.
- The marketing pages do not document a public API. Do not build against one.

## The restaurant's current choices
- **Collection only.** No delivery. Do not enable delivery or the delivery integrations.
- **No online payments** (owner decision). Customers pay at collection.
- Pay-on-collection support in Mobi Online Ordering is **unverified**. Mobi's page says customers pay through "online payment modes or other methods"; that wording does not confirm pay-at-the-till.

## What the website does
1. `site.json` holds `mobi.orderUrl` and `mobi.bookUrl`. Buttons (header, hero, Visit page, mobile bottom bar) use them.
2. Until URLs are provided, buttons go to `/visit/#order` and `/visit/#reserve`, where phone and text numbers are shown. Never ship a button that does nothing (the legacy site did).
3. Preferred setup: Mobi custom domain `order.maldonspice.co.uk` for ordering, and a Mobi booking page opened in a new tab or embedded on `/reserve/` only if it works well on phones. A plain link is the safe default; iframes cause scroll and height problems and block caching. If embedding is used: `loading="lazy"`, a visible fallback link, and a sensible fixed minimum height.
4. Visual consistency: ask Mobi what can be customised (logo, colour). Use `#A5BCC4` and the logo if possible.
5. Always show the phone number beside the buttons.

## Menu synchronisation
Products sync between the Mobi POS and cloud, but the website menu is an independent file (`data/menu.json`) with descriptions and allergens that Mobi does not hold. Two copies means drift. Mitigations:
- Ask Mobi support whether CloudSync supports a product **export (CSV/JSON)**. If yes, add `scripts/diff-mobi.mjs` that compares names and prices and fails CI on mismatches.
- Until then, treat `menu.json` as the website source and review prices against Mobi quarterly or whenever prices change. Put a note at the top of `menu.json` with the date of last price check.
- Use identical dish names in both systems.

## Order-handling risks to test with Mobi (in a quiet week, or on a trial)
- What customers see if the iPad is off, closed or offline. Make sure ordering hours match kitchen hours and the order page shows "closed" outside them.
- The accept/reject step is manual: someone must watch the iPad. Decide who and when.
- Prank or no-show orders when no payment is taken: require a phone number, set a minimum order and a minimum lead time, consider a call-back for first-time customers, cap order value.
- Allergen display on Mobi's order pages: allergen information must be available before a customer completes an order. Ask Mobi how to show it; otherwise add a clear notice linking to `/allergens/` and the menu.
- Confirmation emails: check wording and sender name.
- Cookies and privacy on Mobi pages (reflect in `/privacy/`).

## Questions for Mobi support (send before building)
1. Is pay-on-collection (no online payment) supported on Online Ordering? How does the order appear on the till (paid or unpaid)?
2. Can ordering run on `order.maldonspice.co.uk`, and what DNS records are needed? Can the booking page also use a custom domain?
3. How customisable is the ordering and booking look (logo, colour, fonts)?
4. Can the product list (names, prices, descriptions, allergens) be exported or fetched by URL?
5. Can allergen information be attached to products and shown on the order page?
6. How do closed hours, last-order times and holiday closures work online?
7. Does Google "Reserve" / order integration work for UK businesses?
8. What happens to online orders when the tablet is offline?
