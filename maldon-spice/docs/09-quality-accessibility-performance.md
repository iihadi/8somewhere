# 09. Quality, accessibility and performance

## Budgets (mobile, throttled 4G, mid-range Android)
- Lighthouse Performance, Accessibility, Best Practices, SEO: **95 or above** on Home, `/menu/`, `/visit/`.
- LCP under 2.0 s, INP under 200 ms, CLS 0. Total transfer on Home under 600 KB, requests under 25, JS under 20 KB gzipped (the filter page under 30 KB).
- CSS under 30 KB gzipped. Fonts: at most 5 files, under 120 KB total, preloaded only for the two critical ones.
- No third-party requests on load. Run `check:links` to list any external host referenced in built HTML; only the allow-listed ones (Mobi, Google Maps on tap, social links as plain `<a>`) may appear.

## Accessibility (WCAG 2.2 AA target)
- [ ] Contrast pairs match `docs/02` (run `scripts/contrast.mjs`; fail build below 4.5:1 for text, 3:1 for UI).
- [ ] Skip link to main content; landmarks (`header`, `nav`, `main`, `footer`); one H1; logical heading order.
- [ ] All interactive targets at least 44px (design uses 48px), spacing 8px.
- [ ] Visible focus on every control; focus not hidden behind the sticky bottom bar (add `scroll-padding-bottom`).
- [ ] Tabs on menu pages are links with `aria-current`; filter chips are buttons with `aria-pressed`; count in `aria-live="polite"`.
- [ ] Text resizable to 200% and 400% zoom with no loss of content; reflow at 320px.
- [ ] No content depends on colour alone (allergen codes are letters; selected state has a fill change plus `aria-pressed`).
- [ ] `prefers-reduced-motion` honoured; no autoplay.
- [ ] Phone numbers and addresses are links with clear text. Link text is meaningful out of context.
- [ ] `lang="en-GB"`; `alt` text reviewed; the logo image has `alt="Maldon Spice"`.
- [ ] Tested with keyboard only, VoiceOver (iOS) and TalkBack (Android) on Home, Menu and the filter.
Tools: axe (CI), pa11y, Lighthouse, manual screen-reader pass.

## Responsive and device matrix
Widths 320, 360, 390, 430, 768, 1024, 1280, 1536. Browsers: iOS Safari, Chrome Android, Chrome, Safari, Firefox, Edge. Check landscape phone and a 200% text-size setting. Check the bottom bar with iOS safe-area and Android gesture bar.

## Functional QA
- [ ] Every Order and Reserve button works from every page and goes to the right place (or the `/visit/` fallback with numbers).
- [ ] `tel:` and `sms:` open the right apps on phones.
- [ ] Open-now badge and closures banner behave across midnight, daylight-saving changes, and a test closure.
- [ ] Filter: each allergen toggle hides the right dishes; unknown-status dishes are hidden when any filter is on and the explanation appears; works with JS disabled (full menu visible); URL state restores.
- [ ] Print each menu page.
- [ ] 404 page, redirects, canonical tags, sitemap contents, robots on preview versus production.

## Content QA
- [ ] No text in square brackets anywhere in built HTML.
- [ ] Spelling and British English throughout; "Maldon Spice" written consistently; "Jhual" spelling confirmed.
- [ ] Prices match the printed menu and Mobi.
- [ ] Hours, phone, address match Google Business Profile.
- [ ] No Wi-Fi password anywhere. No legacy "Homepage" title. No Christmas dates unless in closures.
- [ ] Allergen data: every dish status confirmed by the kitchen; reviewer name and date recorded in `menu.json`.

## Security basics for a static site
Headers per `data/_headers`; no inline scripts (use hashed or external scripts so CSP stays tight); no forms in v1; dependencies pinned and audited (`pnpm audit`); Dependabot or Renovate weekly.
