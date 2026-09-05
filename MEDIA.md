# Media manifest

> **Important:** files must live under **`public/`** — that's the only folder the
> site can serve from. A `media/` folder at the project root won't be visible to
> the browser. Working files can live anywhere; anything the site displays goes
> in `public/`.

Drop files into `public/media/...` using these exact names and I'll wire them up.
Anything missing just renders as a grey placeholder — nothing breaks.

**Formats:** photos `.webp` (quality ~80). Videos `.mp4` (H.264, muted, no audio track) + a `.webp` poster frame pulled from frame 1.
**Naming:** all lowercase, hyphens not spaces.

---

## Case study covers — highest priority
These are the two most valuable assets on the site. Screen recordings of the prototypes are ideal: slow, deliberate cursor, no UI chrome, 8–14 seconds, loops cleanly.

| File | What | Size |
|---|---|---|
| `public/media/synechron/cover.mp4` | Process intelligence walkthrough | 1600×900 |
| `public/media/synechron/cover-poster.webp` | First frame, static | 1600×900 |
| `public/media/basis/cover.mp4` | Basis product walkthrough | 1600×900 |
| `public/media/basis/cover-poster.webp` | First frame, static | 1600×900 |

## Basis case study
Most of these already exist in the old GitHub Pages repo — pull them from there.

| File | What |
|---|---|
| `public/media/basis/hero.webp` | Hero image, product shot |
| `public/media/basis/workflow.webp` | 9-step workflow map w/ friction flags |
| `public/media/basis/research-v1.webp` | The V1 prototype that got invalidated |
| `public/media/basis/research-photos.webp` | Raw photo dump, no structure |
| `public/media/basis/research-notes.webp` | Interview notes / quotes |
| `public/media/basis/competitive.webp` | Competitive map |
| `public/media/basis/images-v1.webp` `-v2` `-final` | Image organization iterations |
| `public/media/basis/verify-v1.webp` `-v2` `-final` | Asset verification iterations |
| `public/media/basis/product-1.webp` `-2` `-3` | The three pillars |
| `public/media/basis/photo-1.webp` … `-4` | Demo day, team, whiteboards |
| `public/media/basis/deck.pdf` | Pitch deck |

## Synechron case study

| File | What |
|---|---|
| `public/media/synechron/hero.webp` | Hero image |
| `public/media/synechron/case-hops.webp` | Fraud case across 4 systems, Case ID breaking |
| `public/media/synechron/thread.webp` | Case ID + log + timestamp → one thread |
| `public/media/synechron/dashboard.webp` | Dashboard screen |
| `public/media/synechron/onboarding.webp` | 8-step onboarding |
| `public/media/synechron/process-map.webp` | Process map |
| `public/media/synechron/variants.webp` | Variant triage by jurisdiction |
| `public/media/synechron/competitive.webp` | 2-axis competitive map |
| `public/media/synechron/dashboard-v1.webp` `-v2` | Dashboard iterations |
| `public/media/synechron/skill-feedback.webp` | Skill test rounds / feedback |
| `public/media/synechron/photo-1.webp` … `-4` | NYC, office, team |
| `public/media/synechron/deck.pdf` | Final presentation |

## Layovers — one thumbnail each (4:3, 800×600)

`pienao.webp` · `spotify.webp` · `flyfearless.webp` · `designathon.webp` · `dance.webp` · `food.webp` · `furniture.webp` · `arvr.webp` · `irvins.webp` · `website.webp` · `neoboard.webp`

## About

| File | What |
|---|---|
| `public/media/about/headshot.webp` | Portrait, 3:4, will be window-framed |
| `public/media/places/*.webp` | One photo per travel pin (see `lib/site.ts` → `places`) |

## Icons

| File | Notes |
|---|---|
| `public/favicon.svg` | Airliner mark, blue tile |
| `public/favicon-32.png` `favicon-16.png` | PNG fallbacks |
| `public/apple-touch-icon.png` | 180×180 |
| `public/og.png` | 1200×630 social preview |

---

## Still needed from you (content, not media)

- [ ] Real Beli + Instagram URLs (`lib/site.ts`)
- [ ] LinkedIn URLs for Noah, Adrian, Brian (Basis team)
- [ ] Full list of places since starting college + date + caption for each
- [ ] Synechron: V1→V2 dashboard iteration reasoning, GitHub attempt count, adoption number
- [ ] pienao live URL, furniture site URL
