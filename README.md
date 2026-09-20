# Civic Watch website

The official static website for **Civic Watch**, intended for `https://civicwatchgame.com` and hosted on GitHub Pages. The Mecca Gecko website informed the cinematic landing-page structure; Civic Watch supplies the art, copy, cast and navy/gold UI palette.

## Preview and validate

No npm install or build is required. From this folder:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`. Validate with:

```sh
python3 scripts/validate.py
node --check js/site.js
```

## Editing

- `index.html`: game overview, searchable cast, arena picker, arsenal, Xbox controller diagrams, gallery, FAQs and beta invitation.
- `story.html`: full canonical Fairview backstory.
- `support.html`, `privacy.html`, `terms.html`: existing game support and legal content, with updated shared design and URLs.
- `css/site.css`: responsive styles, animations and reduced-motion behavior. Colors match the game's `UiChrome`: ink `#080f15`, gold `#d9b66e`, text `#e7e8e6`, panel `#111b23`, line `#2b353b`.
- `js/site.js`: accessible native dialogs, roster search/filtering, arena selection, a randomized nine-scene hero slideshow (6-second hold, 1.2-second crossfade, previous/next and pause controls; pauses offscreen and in hidden tabs, starts paused for reduced motion), navigation and scroll reveals.
- `assets/`: optimized copies of the game's loading art, portraits, map previews, weapon previews and Xbox controller diagrams. Fonts are self-hosted Barlow and Barlow Condensed; OFL license is included.
- `assets/game-data.json`: reference snapshot of the game catalog. The site renders content from HTML, so edit the HTML when changing the public copy.

Keep descriptive copy consistent with the game. There are **29 selectable operatives**, **2 bot-only rivals**, **11 arenas**, a separate practice range and **14 firearms**. Personality jokes are not ability descriptions. Zombie skins in the source catalog are upcoming content and are not advertised as released. Loading illustrations are explicitly labeled separately from in-game arena previews.

The TestFlight invitation was carried over from the existing game website and verified to resolve to **Civic Watch FPS** on September 20, 2026. Beta places and supported builds are controlled by App Store Connect.

## GitHub Pages

Repository: https://github.com/joecodecreations/civic-watch-website

Use **Settings → Pages → Deploy from a branch → main → / (root)**. The `.nojekyll` file serves this plain static site without a Jekyll build. The `CNAME` declares `civicwatchgame.com`. Pushes to `main` publish changes. The validation workflow checks internal links, assets, content counts and JavaScript syntax.

## Namecheap connection

After GitHub Pages has `civicwatchgame.com` saved as its custom domain, open Namecheap → Domain List → Manage → Advanced DNS (when using Namecheap BasicDNS).

1. Replace the parking/URL redirect records for `@` and conflicting `www` records. Keep unrelated email records.
2. Add four **A Records**, each with Host `@`, TTL Automatic, and one of these values: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
3. Add a **CNAME Record**, Host `www`, Value `joecodecreations.github.io`, TTL Automatic. Do not include the repository path.
4. Once GitHub's DNS check succeeds and a certificate is issued, turn on **Enforce HTTPS** in Pages settings. DNS/certificate provisioning can take up to 24 hours.

Reference: [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

The website needs no server, database, subscription or API key. Do not copy the private game checkout into this public repository.
