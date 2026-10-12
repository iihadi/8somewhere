# 08. Build, deploy and migration

## Stack
- **Astro** (latest stable), TypeScript strict, static output (`output: 'static'`), `@astrojs/sitemap`, `astro:assets` (sharp). No UI framework. No Tailwind. No CMS in v1.
- CSS: one global stylesheet importing `design/tokens.css`, plus small scoped component styles. No CSS-in-JS.
- JS: islands only where needed, each under a few KB: `filter.ts` (allergen filter), `open-now.ts` (hours badge and banner), `mobile-bar.ts` only if the bar needs behaviour (it should be CSS only).
- Fonts: `@fontsource`/self-hosted WOFF2, Latin subset, `font-display: swap`, preload the display roman and body regular.
- Package manager: `pnpm` (or npm if the owner prefers). Node LTS. Windows-friendly scripts (`.mjs`), no bash-only commands, forward-slash paths, no symlinks.
- Lint and format: ESLint, Prettier, `astro check`.

## Repository layout
```
/ (repo root)
  CLAUDE.md
  docs/            (this handoff, kept)
  data/            site.json, menu.json, images.json, redirects.csv, _redirects, _headers
  design/          tokens.css, tokens.json, reference/ (canvas sources, read-only)
  seo/             meta.json, robots.txt, jsonld/
  scripts/         extract-menu.mjs, process-images.mjs, audit-images.mjs, validate-jsonld.mjs,
                   check-redirects.mjs, check-placeholders.mjs, contrast.mjs, diff-mobi.mjs
  src/
    layouts/  components/  pages/  content.config.ts  assets/images/  styles/
  public/          favicons, og/, robots.txt, _redirects, _headers, fonts/
```
Components to build: `Header`, `MobileBar`, `Hero`, `FactsStrip`, `StoryBlock`, `PhotoPair`, `MenuExtract`, `AllergenBand`, `Recognition`, `VisitBlock`, `Footer`, `MenuTabs`, `AllergenFilter`, `MenuSection`, `DishRow`, `Seo` (head tags and JSON-LD), `Banner`, `OpenNow`.

## npm scripts
`dev`, `build`, `preview`, `check` (astro check + lint), `check:placeholders`, `check:contrast`, `check:menu` (schema + reviewed flags), `check:links`, `check:jsonld`, `images`, `extract:menu`, `lighthouse`. `build` runs `check:menu`, `check:placeholders`, `check:jsonld` first.

## Phased plan
1. **Scaffold**: Astro, tokens, fonts, layout, header, footer, mobile bar, 404. Commit.
2. **Home** to the design (desktop and phone), with real content and interim images.
3. **Menu**: schema, data loading, three menu pages, tabs as links, filter with safety rules, print styles.
4. **Visit, Allergens, Our story, Privacy, and Heritage** (run `scripts/migrate-heritage.mjs` against the live legacy page first, because the source disappears after cutover).
5. **SEO**: head component, JSON-LD, sitemap, robots, OG images, redirects, headers.
6. **Images**: audit, process, alt text, replace placeholders.
7. **Mobi**: wire URLs (or fallbacks), copy checks, test links on a phone.
8. **QA** (`docs/09`), fix, preview deploy on Cloudflare Pages with `noindex`.
9. **Owner review** (allergens and prices especially), then launch.

## Closures and hours (the "stale Christmas hours" fix)
`site.json` is the only place for hours, closures, banner and parking text. Build converts it to: Facts, Visit, footer, JSON-LD hours, closure banner and the open-now badge. Document in a README how the family edits `site.json` (GitHub web editor with a pull-request-free `main` branch protected only by checks, or Decap CMS later). Cloudflare Pages rebuilds on commit.

## Hosting and deploy

> **Decision (12 October 2026): host on IONOS webspace instead of Cloudflare Pages.** The build writes `dist/.htaccess` from `data/redirects.csv` (redirects, 410s, headers, caching, 404). Deploy by SFTP into a new folder, then switch the domain's target folder at cutover; rollback is switching it back. See `README.md` and `.github/workflows/maldon-spice-deploy.yml`. The Cloudflare notes below are kept as the fallback.

- **Cloudflare Pages**, connected to the git repo. Build command `pnpm build`, output `dist`. Preview deployments per branch with `noindex` headers. Production branch `main`.
- Custom domain `maldonspice.co.uk` (apex) and `www` redirecting to apex. HTTPS automatic. Apply `data/_headers` and `data/_redirects` (copy to `public/`).
- **Domain, DNS and email stay at IONOS.** Do not move nameservers unless the owner asks. At cutover add the records Cloudflare Pages requires for the apex and `www` (CNAME flattening or A/AAAA as instructed; IONOS may require a CNAME for `www` and an A record or ALIAS for the apex: check IONOS DNS capabilities before launch day, and if apex CNAME is not supported, consider moving DNS only (not email) to Cloudflare).
- **Do not change MX, SPF, DKIM or DMARC records.** Take a screenshot or export of the full IONOS DNS zone before touching anything.
- If a Mobi subdomain such as `order.` is used, add that record separately as Mobi instructs.

## Cutover and rollback
Before launch:
- [ ] Heritage article and its images migrated and committed (the legacy page is the only source).
- [ ] Back up WordPress (full export: database, `wp-content/uploads`, themes, plugins list) and keep it for at least 90 days. IONOS has a backup tool; download a copy.
- [ ] Crawl the legacy site and finalise the redirect map. Test redirects on the preview with `check-redirects.mjs`.
- [ ] Lower DNS TTL to 300 seconds 24 hours ahead.
- [ ] Final owner review: prices, allergens, hours, phone, address, award text, press line, no placeholders.
- [ ] Google Business Profile links ready to update; Mobi URLs confirmed and tested.
Cutover:
1. Merge to `main`, confirm production build is green and Lighthouse passes on the Pages URL.
2. Add custom domain in Cloudflare Pages; update IONOS DNS records for apex and `www`.
3. Verify HTTPS, `www` to apex, the sitemap, robots, redirects, JSON-LD and the Order and Reserve links.
4. Search Console: verify the property, submit the sitemap, run URL inspection on Home and Menu.
5. Update Google Business Profile (website, menu, reserve, order links, hours).
6. Watch for 404s and redirect errors for two weeks.
Rollback: restore the previous A/CNAME records from the DNS snapshot (WordPress remains running on IONOS until the owner decides to cancel it). Because TTL is 300 seconds, rollback takes minutes. Do not delete WordPress until at least 30 days after launch with no issues.

## Things to delete after launch (security)
Retire the WordPress site's admin accounts and plugins (or take the site offline) once the backup is verified. The legacy site exposes a "ChrisAdmin" username in page metadata: rotate credentials if WordPress stays live anywhere.
