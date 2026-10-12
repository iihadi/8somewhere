# Maldon Spice website

The public website for Maldon Spice, 111 High Street, Maldon. A small static site built with
[Astro](https://astro.build), hosted on IONOS webspace. Bookings and collection orders stay in Mobi POS;
the site only links to them.

The full brief is in `CLAUDE.md` and `docs/`.

## Run it on your computer (Windows, macOS or Linux)

1. Install [Node.js 22 LTS](https://nodejs.org).
2. In this folder: `npm install`
3. `npm run dev` and open http://localhost:4321

Builds:

- `npm run build:preview`: preview build. Allows unreviewed allergen data, shows a DRAFT banner, tells
  search engines not to index it.
- `npm run build`: production build. **Fails while any menu item has `"reviewed": false`.** This is on
  purpose: allergen data must be checked by the kitchen before it goes live.

Both write the finished site to `dist/`, including `dist/.htaccess` (redirects, security headers,
caching and the 404 page for IONOS's Apache servers).

## Everyday edits

All content that changes lives in two files. Edit them on github.com (open the file, click the pencil,
"Commit changes") or in any text editor. Every build checks them, so a mistake stops the build instead
of breaking the live site.

### Hours, closures and the notice banner: `data/site.json`

- **Opening hours:** `hours`. Keep them identical to Google Business Profile.
- **Holiday closures:** add to `closures`. This is the only way to show holiday hours. A banner appears
  automatically from 14 days before, and disappears by itself afterwards:
  ```json
  "closures": [
    { "from": "2026-12-25", "to": "2026-12-27" }
  ]
  ```
  The banner then reads "Closed 25 to 27 December. Back on 28 December." Add `"note": "..."` to use
  your own wording.
- **Any other notice:** set `"banner": { "enabled": true, "text": "Your message" }`.
- **Mobi links:** set `mobi.bookUrl` and `mobi.orderUrl` once Mobi gives you the URLs. Until then,
  every Reserve and Order button goes to the Visit page with the phone numbers.

### Dishes and prices: `data/menu.json`

Each dish looks like this:

```json
{
  "id": "starters-onion-bhaji",
  "name": "Onion Bhaji",
  "description": "Mildly spiced, deep-fried onion balls",
  "prices": [{ "amount": 4.75 }],
  "allergens": ["n"],
  "allergenStatus": "listed",
  "dietary": [],
  "preorder": false,
  "reviewed": true
}
```

- **Change a price:** edit `amount`. Two prices (chicken / lamb) use two entries with a `label`.
- **Add a dish:** copy an existing one, give it a new unique `id`, and fill it in.
- **Allergens:** codes are `d` dairy, `g` gluten, `n` tree nuts, `m` mustard, `e` egg, `f` fish. Only
  use `"allergenStatus": "listed"` when the kitchen's allergy sheet lists that exact dish. If you are not
  sure, use `"needs-check"`: the site then says "Allergens not yet confirmed, please ask", and the filter
  hides it.
- **`reviewed`:** set to `true` only after the kitchen has checked that dish's allergens and price.
- Keep dish names and prices the same as in Mobi POS. Check them against Mobi whenever prices change.

### Photos

Put processed photos in `src/assets/images/`, named after their id in `data/images.json` (for example
`food-mixed-grill.jpg`). They appear automatically; until then the slot shows a plain colour block or is
left out. Alt text lives in `data/images.json`. Never commit original camera files.

### Heritage page

The article text is in `src/content/heritage.md`, copied unchanged from the old site. Don't edit the
author's wording. The photo strip uses the ids listed in `data/heritage.json` (`gallery`). Run
`npm run migrate:heritage` once, **while the old site is still online**, to download the photographs
into `src/assets/heritage/`, then commit them.

## Hosting on IONOS

The site is plain files, so it works on any IONOS Web Hosting package with SFTP access (Apache with
`.htaccess`). The cutover never deletes WordPress:

1. **In IONOS, create a new empty folder** in your webspace, for example `/maldonspice-site`. Never upload
   into the WordPress folder.
2. **Upload `dist/`** into that folder: automatically with the GitHub Action
   (`.github/workflows/maldon-spice-deploy.yml`, see its header for the secrets to add), or by hand with
   FileZilla using the SFTP details from IONOS > Hosting > SFTP & SSH. Make sure the hidden `.htaccess` file
   is uploaded too.
3. **Preview first:** in IONOS > Domains, create a subdomain such as `preview.maldonspice.co.uk`, point it
   at a preview folder, and deploy a preview build there. Check everything on a phone.
4. **Go live:** in IONOS > Domains & SSL > maldonspice.co.uk, change the domain's target folder from the
   WordPress folder to `/maldonspice-site`. Do the same for `www`. SSL stays as it is. Email (MX records)
   is not affected.
5. **Rollback:** point the domain back at the WordPress folder. It takes effect within minutes.
6. After 30 quiet days, back up WordPress (IONOS backup plus a download of `wp-content/uploads`) and only
   then remove it, then downgrade the package if WordPress hosting is no longer needed. Keep the domain and
   email.

If your package is IONOS **Managed WordPress** (no general webspace or SFTP folders), it cannot host
static files. In that case, use an IONOS Web Hosting plan, or IONOS Deploy Now, or move to Cloudflare Pages
(the original plan in `docs/08`).

## Checks

- `npm run check`: TypeScript and Astro diagnostics
- `npm run check:menu`: menu data rules (also runs before every build)
- `npm run check:placeholders`: no placeholder text in the built site (also runs after every build)
- `npm run icons`: regenerate the interim favicon and share image
