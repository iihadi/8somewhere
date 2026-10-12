# 10. Open questions, risks and decisions log

Answer, or record the safe default used. Update this file as work proceeds.

## Must be answered before launch
1. **Allergens (safety):** the kitchen reviews every dish's allergens, including the conflicts listed in `docs/06`. Who signs off, and when?
2. **"Dairy-free" versus "Dairy & Gluten Free":** the PDF title says both; the website says Dairy Free. What can be claimed? Default: say "Dairy-free" only.
3. **Mobi:** pay-on-collection support; order and booking URLs; custom domain; allergen display; behaviour when the tablet is off. Default: buttons link to `/visit/` with phone and text numbers.
4. **Prices:** confirm the standard-curry price grid and all extracted prices against the printed menu.
5. **Minimum charge £17.95** and "extras 65p to 95p" from the legacy menu: still current? Is there a service charge? Default: omit both.
6. **Domain email address** (for example info@maldonspice.co.uk): create at IONOS. Default: omit email.
7. **Legal and privacy details** for the privacy page (trading name, registered address, contact for data requests).
8. **Reviews:** which three recent Google reviews to feature, and permission. Default: omit the reviews block.
9. **Photograph consent and rights** for award and press images. Default: text only on Our story.
10. **Logo source files** (SVG/AI) from the 2021 designer. Default: vectorise from PNG.
11. **Owner names spelling:** the heritage page uses "Jhual" and gives the surname Hafiz (a review wrote "Juhal"). Confirm full names and how they should appear.
12. **Latitude and longitude** for schema (take from the GBP pin).
13. **Price range** for schema (`££`?). Default: omit.
14. **Heritage page rights:** the article is credited to Stephen Nunn and the images to English Heritage. Does the restaurant have permission to republish both on the new site? Default: migrate unchanged with credits, and ask before launch.
14b. **Owner details on the heritage page:** the closing section names Jhual Hafiz, says he is a former Mayor and serving town councillor, and mentions his role in a community association. Which of these should appear on the new site? Default: omit the association; keep the rest only if the owner confirms. Also confirm the 1978 claim (Indian cuisine reaching Maldon and the first Indian restaurant opening at 111 High Street).
14c. **Who to name** as owner(s): the About text names Jhual and Shamema; the heritage page names Jhual Hafiz and family.
14d. **Subheadings and a key-dates list** on the heritage page change the presentation of the author's article. Approve with the author or owner first. Default: key dates only as a separate aside, no subheadings.
15. **Who edits `site.json`** (hours, closures, banner)? Teach them the GitHub web editor, or add Decap later.

## Decisions already made (do not reopen without a reason)
- Colour: blue-grey `#A5BCC4` leads; deep `#2F4752`, pale and mist tints, white; `spice` and `sand` as small accents.
- Static Astro on Cloudflare Pages; IONOS keeps domain, DNS and email.
- Collection only, no delivery, no online payments.
- Ordering and booking stay in Mobi POS; website links out.
- No Google Analytics, no cookie banner (cookieless analytics only), no third-party widgets, no map on load.
- Allergen filter hides unconfirmed dishes when active.

## Risks
- **Allergen data errors** (highest). Mitigation: unreviewed data cannot ship; unknown is hidden under filter.
- **Mobi limitations** (pay-on-collection, customisation, closed hours). Mitigation: early support questions; link-based fallback.
- **Photography quality** limits the design. Mitigation: shoot plan; image slots are data-driven.
- **SEO loss at cutover.** Mitigation: full crawl, one-hop 301s, keep `/heritage/`, monitor Search Console.
- **Two copies of the menu** (website and Mobi). Mitigation: export diff if available; quarterly price check.
- **Single maintainer.** Mitigation: README for the family on editing `site.json`; keep dependencies minimal.
- **IONOS apex DNS limitations.** Mitigation: check DNS capabilities before launch day; fallback is moving DNS only to Cloudflare while leaving mail records identical.

## Not covered by this handoff
I could not access `F:\Work\websiteWork\Maldon Spice` from the planning session, could not open Row on 5's own website (its domain rowon5.com is a parked page), and have not rendered the phone layouts myself. The design preview's phone frames and the live pages must be checked on real devices.
