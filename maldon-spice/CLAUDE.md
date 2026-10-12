# Maldon Spice website rebuild: brief for Claude Code

You are building the new public website for **Maldon Spice**, an Indian restaurant at 111 High Street, Maldon CM9 5BS (maldonspice.co.uk). It replaces a slow WordPress/Elementor site on IONOS. Read this file, then the docs in order. Everything needed to start is in this folder; nothing here requires asking the owner first except the items in `docs/10-open-questions.md`.

## What to build

A small, fast, static, accessible site. Pages: Home, Menu (Main / Dairy-free / Drinks), Allergens, Visit, Our story, Maldon heritage (migrate existing page), Privacy and cookies, 404.

- **Stack:** latest stable Astro, TypeScript, plain CSS driven by `design/tokens.css` (no Tailwind, no UI kit), vanilla JS only where needed (menu allergen filter, open-now badge, closures banner). Node scripts only (`.mjs`), the owner works on Windows.
- **Host:** Cloudflare Pages. Domain, DNS and email stay at IONOS. See `docs/08-build-deploy-migration.md`.
- **Ordering and booking** stay in Mobi POS. The website links to Mobi; it does not take orders or payments. See `docs/05-mobi-integration.md`.

## Read in this order

0. **Do first, while the legacy site is still online:** run `scripts/migrate-heritage.mjs` (heritage article and images) and the menu extraction in `docs/06`. The legacy URLs are the only source for these.
1. `docs/01-brief-and-goals.md`
2. `docs/02-design-system.md` and `design/` (tokens, reference artboards, live preview link)
3. `docs/03-pages-and-content.md`
4. `docs/06-menu-data.md` and `data/menu.json`
5. `docs/04-seo.md`, `seo/`, `data/redirects.csv`
6. `docs/07-images-and-assets.md`
7. `docs/05-mobi-integration.md`
8. `docs/09-quality-accessibility-performance.md`
9. `docs/08-build-deploy-migration.md`
10. `docs/10-open-questions.md`

## Hard rules

- **Allergen information is safety-critical.** Never invent, infer or "tidy" allergen data. Every dish needs `allergens` from the allergy sheet or an explicit `allergenStatus` flag. The UI must never imply a dish is safe. See `docs/06-menu-data.md`.
- **No placeholder text ships.** Anything in square brackets in the design (`[Photograph: ...]`, `[Domain email address]`, `[A recent guest review...]`) must be replaced with real content or the element removed. `npm run check:placeholders` must pass.
- **Do not publish** the guest Wi-Fi password found in the legacy main-menu PDF.
- **Do not copy** the legacy site's slider, popups, social feeds or Elementor markup.
- Keep the design restrained: flat colour fields, hairlines, no cards with shadows, no rounded-corner card grids, no gradients, no emoji, no stock imagery.
- **Mobile first.** Most visitors use a phone. Every page must be usable one-handed at 360px wide.
- Commit in small steps with clear messages. Do not commit original photographs.

## Definition of done

- Lighthouse (mobile, throttled) Performance, Accessibility, Best Practices, SEO all 95 or above on Home, Menu and Visit.
- `docs/09-quality-accessibility-performance.md` checklist passes.
- Redirect map verified with `scripts/check-redirects.mjs` against the live legacy URL list.
- JSON-LD validates (Rich Results Test / schema.org validator) for Home and Menu.
- Preview deployed on a Cloudflare Pages URL with `noindex`, ready for the owners to review.
- `docs/10-open-questions.md` updated with answers or still-open items.

## When blocked

Prefer a safe default plus a note in `docs/10-open-questions.md` over stopping. Stop and ask only for: allergen decisions, prices you cannot verify, legal wording, Mobi URLs, and anything that would change the live domain or DNS.
