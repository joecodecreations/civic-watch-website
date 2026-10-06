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

- `index.html`: gameplay trailer (`#trailer`), game overview, searchable cast, arena picker (with a Bot match / Infestation lighting toggle), Infestation modes and the five insect classes, arsenal, Xbox controller diagrams, gallery, FAQs and beta invitation. The old browser demo is gone.
- `story.html`: full canonical Fairview backstory.
- `support.html`, `privacy.html`, `terms.html`: existing game support and legal content, with updated shared design and URLs.
- `css/site.css`: responsive styles, animations and reduced-motion behavior. Colors match the game's `UiChrome`: ink `#080f15`, gold `#d9b66e`, text `#e7e8e6`, panel `#111b23`, line `#2b353b`.
- `js/site.js`: accessible native dialogs, roster search/filtering, arena selection, a randomized nine-scene hero slideshow (6-second hold, 1.2-second crossfade, previous/next and pause controls; pauses offscreen and in hidden tabs, starts paused for reduced motion), navigation and scroll reveals.
- `assets/`: optimized copies of the game's loading art, portraits, map previews, weapon previews and Xbox controller diagrams. Fonts are self-hosted Barlow and Barlow Condensed; OFL license is included.
- `assets/trailer/`: web copy of the game's App Store preview (`golden-eye/tools/app_store_previews/out/preview.mp4`), re-encoded to about 16 MB (two-pass H.264 at 4.2 Mbps, `+faststart`), with `trailer-poster.webp` taken at 0.5 s. The player uses `preload="none"`, so nothing downloads until someone presses play. Section styles live in `css/trailer.css`. To refresh it after a re-cut:

  ```sh
  SRC=../golden-eye/tools/app_store_previews/out/preview.mp4
  ffmpeg -y -i $SRC -c:v libx264 -preset slow -b:v 4200k -maxrate 6500k -bufsize 9000k -pix_fmt yuv420p -pass 1 -an -f mp4 /dev/null
  ffmpeg -y -i $SRC -c:v libx264 -preset slow -b:v 4200k -maxrate 6500k -bufsize 9000k -pix_fmt yuv420p -pass 2 -c:a aac -b:a 128k -movflags +faststart assets/trailer/civic-watch-trailer.mp4
  ffmpeg -y -ss 0.5 -i $SRC -frames:v 1 /tmp/poster.png && cwebp -q 80 /tmp/poster.png -o assets/trailer/trailer-poster.webp
  ```
- `assets/game-data.json`: reference snapshot of the game catalog. The site renders content from HTML, so edit the HTML when changing the public copy.

Keep descriptive copy consistent with the game. There are **29 selectable operatives**, **2 bot-only rivals**, **14 arenas**, a separate practice range, **14 firearms** plus a knife or two-handed axe for melee. Every arena has a combat plate (`assets/maps/<id>.webp`) and an Infestation plate (`assets/maps/<id>_infestation.webp`). Game modes: bot deathmatch, solo Infestation, and online free-for-all, Infestation co-op, Infestation team battle, infection and gun range events. The five Infestation classes are Lurker, Skitter, Spitter, Crawler and Hive Tick. Weapon names match the game's catalog (Timber 47, Hedgecutter, Sandpiper, Picket 9 and so on). Personality jokes are not ability descriptions. Loading illustrations are explicitly labeled separately from in-game arena previews. Use the name Infestation for that mode.

The TestFlight invitation was carried over from the existing game website and verified to resolve to **Civic Watch FPS** on September 20, 2026. Beta places and supported builds are controlled by App Store Connect. It was taken off the site on September 21, 2026 and put back on September 24, 2026.

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

## Analytics

Every public page, including the playable demo, loads Google tag `G-5CKV6VD9KM` at the start of `<head>`. The demo pages also allow `https://www.googletagmanager.com` and the Google Analytics collection hosts in their content-security policy so the tag can send page views. `scripts/validate.py` fails if a page drops the tag. The privacy policy discloses the measurement.
