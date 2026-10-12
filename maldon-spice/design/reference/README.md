# Design reference (read-only)

Live preview: https://claude.ai/artifact/8XrHW1PFz6BA4wezsuehJZ (open in a browser; desktop and phone frames side by side).

These `.dc.html` files are the design canvas sources. They use a proprietary component format (`<x-dc>`, `<sc-for>`, `{{holes}}`), so do not copy them into the build. Read them for:
- exact copy and dish data (inline JS in `Menu.dc.html`),
- spacing, sizes, colours and structure (inline styles),
- responsive rules (the `@media (max-width: 720px)` block in each file's `<helmet>`),
- the mobile bottom bar (`.stickybar`).

`Home.dc.html` was `Main.dc.html` in the canvas (the canvas requires that name for its entry). `MobileHome`, `MobileMenu` and `MobileHeritage` import the others at 390px and exist only to show phone layouts.

Known gaps in the prototype: no allergen rule for unconfirmed dishes (docs/06), no `?avoid=` URL state, placeholder photo blocks, typeset wordmark instead of the logo, no real open-now logic, tabs are buttons in the prototype but must be links in the build.
